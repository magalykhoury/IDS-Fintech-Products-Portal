using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class UpdateProductRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(1000)]
    public string? BusinessPurpose { get; set; }

    [Required]
    [MaxLength(50)]
    [RegularExpression(
        "^(Active|Maintenance|Planned|Deprecated)$",
        ErrorMessage = "LifecycleStatus must be Active, Maintenance, Planned, or Deprecated."
    )]
    public string LifecycleStatus { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? CurrentVersion { get; set; }

    [MaxLength(255)]
    public string? SupportedMarkets { get; set; }

    [MaxLength(50)]
    [RegularExpression(
        "^(Low|Medium|High|Critical)$",
        ErrorMessage = "Criticality must be Low, Medium, High, or Critical."
    )]
    public string? Criticality { get; set; }

    public string? Notes { get; set; }
}