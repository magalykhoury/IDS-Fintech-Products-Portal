using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EnvironmentsController : ControllerBase
{
    private readonly IEnvironmentRepository _environmentRepository;
    private readonly IDeploymentRepository _deploymentRepository;

    public EnvironmentsController(
        IEnvironmentRepository environmentRepository,
        IDeploymentRepository deploymentRepository)
    {
        _environmentRepository = environmentRepository;
        _deploymentRepository = deploymentRepository;
    }

    // GET: /api/environments
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var environments = await _environmentRepository.GetAllAsync();

        return Ok(environments);
    }

    // GET: /api/environments/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var environment = await _environmentRepository.GetByIdAsync(id);

        if (environment is null)
        {
            return NotFound(new
            {
                message = $"Environment with ID {id} does not exist."
            });
        }

        return Ok(environment);
    }

    // POST: /api/environments
    [Authorize(Policy = "DeploymentManage")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateEnvironmentRequest request)
    {
        var deployment =
            await _deploymentRepository.GetByIdAsync(request.DeploymentId);

        if (deployment is null)
        {
            return BadRequest(new
            {
                message =
                    $"Deployment with ID {request.DeploymentId} does not exist."
            });
        }

        var id = await _environmentRepository.CreateAsync(request);

        var environment =
            await _environmentRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            environment
        );
    }

    // PUT: /api/environments/1
    [Authorize(Policy = "DeploymentManage")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateEnvironmentRequest request)
    {
        var existingEnvironment =
            await _environmentRepository.GetByIdAsync(id);

        if (existingEnvironment is null)
        {
            return NotFound(new
            {
                message = $"Environment with ID {id} does not exist."
            });
        }

        var deployment =
            await _deploymentRepository.GetByIdAsync(request.DeploymentId);

        if (deployment is null)
        {
            return BadRequest(new
            {
                message =
                    $"Deployment with ID {request.DeploymentId} does not exist."
            });
        }

        var updated =
            await _environmentRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var environment =
            await _environmentRepository.GetByIdAsync(id);

        return Ok(environment);
    }

    // DELETE: /api/environments/1
    [Authorize(Policy = "DeploymentManage")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var environment =
            await _environmentRepository.GetByIdAsync(id);

        if (environment is null)
        {
            return NotFound(new
            {
                message = $"Environment with ID {id} does not exist."
            });
        }

        var deleted =
            await _environmentRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
