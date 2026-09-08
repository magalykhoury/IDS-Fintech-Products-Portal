using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TeamMembersController : ControllerBase
{
    private readonly ITeamMemberRepository _teamMemberRepository;

    public TeamMembersController(
        ITeamMemberRepository teamMemberRepository)
    {
        _teamMemberRepository = teamMemberRepository;
    }

    // --------------------------------------------------
    // GET ALL TEAM MEMBERS
    // --------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var teamMembers =
            await _teamMemberRepository.GetAllAsync();

        return Ok(teamMembers);
    }

    // --------------------------------------------------
    // GET TEAM MEMBER BY ID
    // --------------------------------------------------

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var teamMember =
            await _teamMemberRepository.GetByIdAsync(id);

        if (teamMember is null)
        {
            return NotFound(new
            {
                message = $"Team member with ID {id} does not exist."
            });
        }

        return Ok(teamMember);
    }

    // --------------------------------------------------
    // CREATE TEAM MEMBER
    // --------------------------------------------------

    [Authorize(Policy = "PortalWrite")]
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateTeamMemberRequest request)
    {
        var id =
            await _teamMemberRepository.CreateAsync(request);

        var teamMember =
            await _teamMemberRepository.GetByIdAsync(id);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            teamMember
        );
    }

    // --------------------------------------------------
    // UPDATE TEAM MEMBER
    // --------------------------------------------------

    [Authorize(Policy = "PortalWrite")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateTeamMemberRequest request)
    {
        var existing =
            await _teamMemberRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Team member with ID {id} does not exist."
            });
        }

        var updated =
            await _teamMemberRepository.UpdateAsync(id, request);

        if (!updated)
        {
            return NotFound();
        }

        var teamMember =
            await _teamMemberRepository.GetByIdAsync(id);

        return Ok(teamMember);
    }

    // --------------------------------------------------
    // DELETE TEAM MEMBER
    // --------------------------------------------------

    [Authorize(Policy = "PortalWrite")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing =
            await _teamMemberRepository.GetByIdAsync(id);

        if (existing is null)
        {
            return NotFound(new
            {
                message = $"Team member with ID {id} does not exist."
            });
        }

        var deleted =
            await _teamMemberRepository.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
