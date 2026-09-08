using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdsFintechPortal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/intelligence")]
public sealed class IntelligenceController : ControllerBase
{
    private readonly PortalIntelligenceService _intelligenceService;

    public IntelligenceController(PortalIntelligenceService intelligenceService)
    {
        _intelligenceService = intelligenceService;
    }

    [HttpPost("query")]
    public async Task<ActionResult<IntelligenceQueryResponse>> Query(
        IntelligenceQueryRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _intelligenceService.QueryAsync(
            request.Question,
            cancellationToken);

        return Ok(response);
    }
}
