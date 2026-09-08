using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public sealed class IntelligenceQueryRequest
{
    [Required]
    [StringLength(500, MinimumLength = 2)]
    public string Question { get; set; } = string.Empty;
}

public sealed class IntelligenceQueryResponse
{
    public string Answer { get; set; } = string.Empty;

    public string ProviderStatus { get; set; } = string.Empty;

    public string? Model { get; set; }

    public IReadOnlyList<IntelligenceSourceResponse> Sources { get; set; } = [];
}

public sealed class IntelligenceSourceResponse
{
    public string EntityType { get; set; } = string.Empty;

    public int EntityId { get; set; }

    public string Label { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;
}
