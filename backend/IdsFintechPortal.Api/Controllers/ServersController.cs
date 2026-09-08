using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServersController : ControllerBase
{
    private readonly IServerRepository _serverRepository;
    private readonly IEnvironmentRepository _environmentRepository;

    public ServersController(
        IServerRepository serverRepository,
        IEnvironmentRepository environmentRepository)
    {
        _serverRepository = serverRepository;
        _environmentRepository = environmentRepository;
    }

    // GET: /api/servers
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var servers = await _serverRepository.GetAllAsync();

        return Ok(servers);
    }

    // GET: /api/servers/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var server = await _serverRepository.GetByIdAsync(id);

        if (server is null)
        {
            return NotFound(new
            {
                message = $"Server with ID {id} does not exist."
            });
        }

        return Ok(server);
    }

    // POST: /api/servers
    [Authorize(Policy = "DeploymentManage")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateServerRequest request)
    {
        var environment =
            await _environmentRepository.GetByIdAsync(request.EnvironmentId);

        if (environment is null)
        {
            return BadRequest(new
            {
                message =
                    $"Environment with ID {request.EnvironmentId} does not exist."
            });
        }

        var id = await _serverRepository.CreateAsync(request);

        var server = await _serverRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            server
        );
    }

    // PUT: /api/servers/1
    [Authorize(Policy = "DeploymentManage")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateServerRequest request)
    {
        var existingServer =
            await _serverRepository.GetByIdAsync(id);

        if (existingServer is null)
        {
            return NotFound(new
            {
                message = $"Server with ID {id} does not exist."
            });
        }

        var environment =
            await _environmentRepository.GetByIdAsync(request.EnvironmentId);

        if (environment is null)
        {
            return BadRequest(new
            {
                message =
                    $"Environment with ID {request.EnvironmentId} does not exist."
            });
        }

        var updated =
            await _serverRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var server =
            await _serverRepository.GetByIdAsync(id);

        return Ok(server);
    }

    // DELETE: /api/servers/1
    [Authorize(Policy = "DeploymentManage")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var server =
            await _serverRepository.GetByIdAsync(id);

        if (server is null)
        {
            return NotFound(new
            {
                message = $"Server with ID {id} does not exist."
            });
        }

        var deleted =
            await _serverRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
