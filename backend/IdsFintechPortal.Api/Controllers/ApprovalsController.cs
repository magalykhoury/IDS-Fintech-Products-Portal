using System.Security.Claims;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using IdsFintechPortal.Api.Services;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ApprovalsController : ControllerBase
{
    private readonly IApprovalRepository _approvalRepository;
    private readonly NotificationService _notificationService;
    private readonly IDeploymentRepository _deploymentRepository;

    public ApprovalsController(
        IApprovalRepository approvalRepository,
        NotificationService notificationService,
        IDeploymentRepository deploymentRepository)
    {
        _approvalRepository = approvalRepository;
        _notificationService = notificationService;
        _deploymentRepository = deploymentRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _approvalRepository.GetForUserAsync(userId.Value, CanReview()));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var approval = await _approvalRepository.GetByIdAsync(id);
        if (approval is null) return NotFound(new { message = $"Approval request with ID {id} does not exist." });
        if (!CanReview() && approval.RequestedByUserId != GetUserId()) return Forbid();
        return Ok(approval);
    }

    [Authorize(Policy = "DeploymentManage")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateApprovalRequest request)
    {
        if (!string.Equals(request.EntityType, "Deployment", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only deployment approval requests are supported." });

        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var deployment = await _deploymentRepository.GetByIdAsync(request.EntityId);
        if (deployment is null) return BadRequest(new { message = $"Deployment with ID {request.EntityId} does not exist." });
        if (await _approvalRepository.HasPendingAsync("Deployment", request.EntityId))
            return BadRequest(new { message = "This deployment already has a pending approval request." });

        var title = $"Deployment approval: {deployment.ClientName} / {deployment.ProductName}";
        int id;
        try
        {
            id = await _approvalRepository.CreateAsync("Deployment", request.EntityId, title, request.Description, userId.Value);
        }
        catch (SqlException exception) when (exception.Number is 2601 or 2627)
        {
            return BadRequest(new { message = "This deployment already has a pending approval request." });
        }

        await _notificationService.ApprovalRequestedAsync(id, request.EntityId, title, userId.Value);
        return CreatedAtAction(nameof(GetById), new { id }, await _approvalRepository.GetByIdAsync(id));
    }

    [Authorize(Policy = "PortalWrite")]
    [HttpPut("{id:int}/decision")]
    public async Task<IActionResult> Decide(int id, ReviewApprovalRequest request)
    {
        var reviewerId = GetUserId();
        if (reviewerId is null) return Unauthorized();
        var approval = await _approvalRepository.GetByIdAsync(id);
        if (approval is null) return NotFound(new { message = $"Approval request with ID {id} does not exist." });
        if (approval.Status != "Pending") return BadRequest(new { message = "Only pending approval requests can be reviewed." });
        if (approval.RequestedByUserId == reviewerId.Value) return BadRequest(new { message = "The requester cannot review their own approval request." });

        if (!await _approvalRepository.ReviewAsync(id, reviewerId.Value, request.Status, request.Comment))
            return BadRequest(new { message = "Approval request could not be reviewed." });

        await _notificationService.ApprovalDecidedAsync(
            approval.RequestedByUserId,
            id,
            approval.EntityId,
            approval.Title,
            request.Status);
        return Ok(await _approvalRepository.GetByIdAsync(id));
    }

    private int? GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : null;
    }

    private bool CanReview() => User.IsInRole("Admin") || User.IsInRole("Management");
}
