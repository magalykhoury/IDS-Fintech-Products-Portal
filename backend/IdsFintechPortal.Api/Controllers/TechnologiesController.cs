using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TechnologiesController : ControllerBase
{
    private readonly ITechnologyRepository _technologyRepository;

    public TechnologiesController(
        ITechnologyRepository technologyRepository)
    {
        _technologyRepository = technologyRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var technologies =
            await _technologyRepository.GetAllAsync();

        return Ok(technologies);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var technology =
            await _technologyRepository.GetByIdAsync(id);

        if (technology is null)
        {
            return NotFound(new
            {
                message = $"Technology with ID {id} does not exist."
            });
        }

        return Ok(technology);
    }

    [Authorize(Policy = "PortalWrite")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateTechnologyRequest request)
    {
        var id =
            await _technologyRepository.CreateAsync(request);

        var technology =
            await _technologyRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            technology
        );
    }

    [Authorize(Policy = "PortalWrite")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateTechnologyRequest request)
    {
        var existing =
            await _technologyRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Technology with ID {id} does not exist."
            });
        }

        var updated =
            await _technologyRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var technology =
            await _technologyRepository.GetByIdAsync(id);

        return Ok(technology);
    }

    [Authorize(Policy = "PortalWrite")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing =
            await _technologyRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Technology with ID {id} does not exist."
            });
        }

        var deleted =
            await _technologyRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
