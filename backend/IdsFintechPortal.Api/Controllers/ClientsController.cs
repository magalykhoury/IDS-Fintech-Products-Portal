using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientRepository _clientRepository;

    public ClientsController(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clients = await _clientRepository.GetAllAsync();
        return Ok(clients);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await _clientRepository.GetByIdAsync(id);

        if (client is null)
        {
            return NotFound();
        }

        return Ok(client);
    }

    [Authorize(Policy = "PortalWrite")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateClientRequest request)
    {
        var id = await _clientRepository.CreateAsync(request);

        var client = await _clientRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            client
        );
    }

    [Authorize(Policy = "PortalWrite")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateClientRequest request)
    {
        var updated = await _clientRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var client = await _clientRepository.GetByIdAsync(id);

        return Ok(client);
    }

    [Authorize(Policy = "PortalWrite")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _clientRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
