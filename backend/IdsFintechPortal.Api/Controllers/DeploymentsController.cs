using System.Security.Claims;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using IdsFintechPortal.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DeploymentsController : ControllerBase
{
    private readonly IDeploymentRepository _deploymentRepository;
    private readonly IClientRepository _clientRepository;
    private readonly IProductRepository _productRepository;
    private readonly IDeploymentModuleRepository _deploymentModuleRepository;
    private readonly IProductModuleRepository _productModuleRepository;
    private readonly IDeploymentResponsibilityRepository _deploymentResponsibilityRepository;
    private readonly ITeamMemberRepository _teamMemberRepository;
    private readonly NotificationService _notificationService;

    public DeploymentsController(
        IDeploymentRepository deploymentRepository,
        IClientRepository clientRepository,
        IProductRepository productRepository,
        IDeploymentModuleRepository deploymentModuleRepository,
        IProductModuleRepository productModuleRepository,
        IDeploymentResponsibilityRepository deploymentResponsibilityRepository,
        ITeamMemberRepository teamMemberRepository,
        NotificationService notificationService)
    {
        _deploymentRepository = deploymentRepository;
        _clientRepository = clientRepository;
        _productRepository = productRepository;
        _deploymentModuleRepository = deploymentModuleRepository;
        _productModuleRepository = productModuleRepository;
        _deploymentResponsibilityRepository = deploymentResponsibilityRepository;
        _teamMemberRepository = teamMemberRepository;
        _notificationService = notificationService;
    }

    // --------------------------------------------------
    // GET ALL DEPLOYMENTS
    // --------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var deployments =
            await _deploymentRepository.GetAllAsync();

        return Ok(deployments);
    }

    // --------------------------------------------------
    // GET DEPLOYMENT BY ID
    // --------------------------------------------------

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        return Ok(deployment);
    }

    // --------------------------------------------------
    // CREATE DEPLOYMENT
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateDeploymentRequest request)
    {
        var client =
            await _clientRepository.GetByIdAsync(
                request.ClientId
            );

        if (client is null)
        {
            return BadRequest(new
            {
                message =
                    $"Client with ID {request.ClientId} does not exist."
            });
        }

        var product =
            await _productRepository.GetByIdAsync(
                request.ProductId
            );

        if (product is null)
        {
            return BadRequest(new
            {
                message =
                    $"Product with ID {request.ProductId} does not exist."
            });
        }

        var id =
            await _deploymentRepository.CreateAsync(
                request
            );

        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            deployment
        );
    }

    // --------------------------------------------------
    // UPDATE DEPLOYMENT
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateDeploymentRequest request)
    {
        var existingDeployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (existingDeployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var client =
            await _clientRepository.GetByIdAsync(
                request.ClientId
            );

        if (client is null)
        {
            return BadRequest(new
            {
                message =
                    $"Client with ID {request.ClientId} does not exist."
            });
        }

        var product =
            await _productRepository.GetByIdAsync(
                request.ProductId
            );

        if (product is null)
        {
            return BadRequest(new
            {
                message =
                    $"Product with ID {request.ProductId} does not exist."
            });
        }

        var updated =
            await _deploymentRepository.UpdateAsync(
                id,
                request
            );

        if (!updated)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is not null)
        {
            var deploymentName = $"{deployment.ClientName} / {deployment.ProductName}";
            var actorUserId = GetUserId();

            if (!string.Equals(existingDeployment.Status, deployment.Status, StringComparison.OrdinalIgnoreCase))
            {
                await _notificationService.DeploymentStatusChangedAsync(
                    deployment.Id,
                    deploymentName,
                    existingDeployment.Status,
                    deployment.Status,
                    actorUserId);
            }

            if (!string.Equals(existingDeployment.ProductVersion, deployment.ProductVersion, StringComparison.OrdinalIgnoreCase))
            {
                await _notificationService.DeploymentVersionChangedAsync(
                    deployment.Id,
                    deploymentName,
                    existingDeployment.ProductVersion,
                    deployment.ProductVersion,
                    actorUserId);
            }
        }

        return Ok(deployment);
    }

    // --------------------------------------------------
    // DELETE DEPLOYMENT
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var deleted =
            await _deploymentRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} could not be deleted."
            });
        }

        return NoContent();
    }

    // --------------------------------------------------
    // GET ENABLED MODULES FOR DEPLOYMENT
    // --------------------------------------------------

    [HttpGet("{id:int}/modules")]
    public async Task<IActionResult> GetModules(int id)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var modules =
            await _deploymentModuleRepository
                .GetByDeploymentIdAsync(id);

        return Ok(modules);
    }

    // --------------------------------------------------
    // ADD MODULE TO DEPLOYMENT
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpPost("{id:int}/modules/{productModuleId:int}")]
    public async Task<IActionResult> AddModule(
        int id,
        int productModuleId)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var productModule =
            await _productModuleRepository.GetByIdAsync(
                productModuleId
            );

        if (productModule is null)
        {
            return BadRequest(new
            {
                message =
                    $"Product module with ID {productModuleId} does not exist."
            });
        }

        if (productModule.ProductId != deployment.ProductId)
        {
            return BadRequest(new
            {
                message =
                    $"Module {productModuleId} does not belong to product {deployment.ProductId}."
            });
        }

        var added =
            await _deploymentModuleRepository.AddAsync(
                id,
                productModuleId
            );

        if (!added)
        {
            return BadRequest(new
            {
                message =
                    "Module is already enabled for this deployment."
            });
        }

        var modules =
            await _deploymentModuleRepository
                .GetByDeploymentIdAsync(id);

        return Ok(modules);
    }

    // --------------------------------------------------
    // REMOVE MODULE FROM DEPLOYMENT
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpDelete("{id:int}/modules/{productModuleId:int}")]
    public async Task<IActionResult> RemoveModule(
        int id,
        int productModuleId)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var removed =
            await _deploymentModuleRepository.RemoveAsync(
                id,
                productModuleId
            );

        if (!removed)
        {
            return NotFound(new
            {
                message =
                    $"Module {productModuleId} is not enabled for deployment {id}."
            });
        }

        return NoContent();
    }

    // --------------------------------------------------
    // GET DEPLOYMENT TEAM / RESPONSIBILITIES
    // --------------------------------------------------

    [HttpGet("{id:int}/team")]
    public async Task<IActionResult> GetTeam(int id)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var responsibilities =
            await _deploymentResponsibilityRepository
                .GetByDeploymentIdAsync(id);

        return Ok(responsibilities);
    }

    // --------------------------------------------------
    // ADD TEAM MEMBER RESPONSIBILITY TO DEPLOYMENT
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpPost("{id:int}/team")]
    public async Task<IActionResult> AddTeamMember(
        int id,
        CreateDeploymentResponsibilityRequest request)
    {
        if (request.DeploymentId != id)
        {
            return BadRequest(new
            {
                message =
                    "Deployment ID in the URL must match DeploymentId in the request."
            });
        }

        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var teamMember =
            await _teamMemberRepository.GetByIdAsync(
                request.TeamMemberId
            );

        if (teamMember is null)
        {
            return BadRequest(new
            {
                message =
                    $"Team member with ID {request.TeamMemberId} does not exist."
            });
        }

        await _deploymentResponsibilityRepository
            .CreateAsync(request);

        var responsibilities =
            await _deploymentResponsibilityRepository
                .GetByDeploymentIdAsync(id);

        return Ok(responsibilities);
    }

    // --------------------------------------------------
    // UPDATE DEPLOYMENT RESPONSIBILITY
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpPut("{id:int}/team/{responsibilityId:int}")]
    public async Task<IActionResult> UpdateTeamMember(
        int id,
        int responsibilityId,
        CreateDeploymentResponsibilityRequest request)
    {
        if (request.DeploymentId != id)
        {
            return BadRequest(new
            {
                message =
                    "Deployment ID in the URL must match DeploymentId in the request."
            });
        }

        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var teamMember =
            await _teamMemberRepository.GetByIdAsync(
                request.TeamMemberId
            );

        if (teamMember is null)
        {
            return BadRequest(new
            {
                message =
                    $"Team member with ID {request.TeamMemberId} does not exist."
            });
        }

        var existingResponsibilities =
            await _deploymentResponsibilityRepository
                .GetByDeploymentIdAsync(id);

        var existingResponsibility =
            existingResponsibilities.FirstOrDefault(
                responsibility =>
                    responsibility.Id ==
                    responsibilityId
            );

        if (existingResponsibility is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment responsibility with ID {responsibilityId} does not exist for deployment {id}."
            });
        }

        var updated =
            await _deploymentResponsibilityRepository
                .UpdateAsync(
                    responsibilityId,
                    request
                );

        if (!updated)
        {
            return NotFound(new
            {
                message =
                    $"Deployment responsibility with ID {responsibilityId} could not be updated."
            });
        }

        var responsibilities =
            await _deploymentResponsibilityRepository
                .GetByDeploymentIdAsync(id);

        return Ok(responsibilities);
    }

    // --------------------------------------------------
    // REMOVE DEPLOYMENT RESPONSIBILITY
    // --------------------------------------------------

    [Authorize(Policy = "DeploymentManage")]
    [HttpDelete("{id:int}/team/{responsibilityId:int}")]
    public async Task<IActionResult> RemoveTeamMember(
        int id,
        int responsibilityId)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(id);

        if (deployment is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment with ID {id} does not exist."
            });
        }

        var existingResponsibilities =
            await _deploymentResponsibilityRepository
                .GetByDeploymentIdAsync(id);

        var existingResponsibility =
            existingResponsibilities.FirstOrDefault(
                responsibility =>
                    responsibility.Id ==
                    responsibilityId
            );

        if (existingResponsibility is null)
        {
            return NotFound(new
            {
                message =
                    $"Deployment responsibility with ID {responsibilityId} does not exist for deployment {id}."
            });
        }

        var deleted =
            await _deploymentResponsibilityRepository
                .DeleteAsync(responsibilityId);

        if (!deleted)
        {
            return NotFound(new
            {
                message =
                    $"Deployment responsibility with ID {responsibilityId} could not be deleted."
            });
        }

        return NoContent();
    }

    private int GetUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
}
