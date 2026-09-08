using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class UpdateEnvironmentRequest
{
    [Required]
    public int DeploymentId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Purpose { get; set; }

    [MaxLength(500)]
    public string? ApplicationUrl { get; set; }

    [MaxLength(500)]
    public string? DatabaseInformation { get; set; }

    [MaxLength(500)]
    public string? MonitoringUrl { get; set; }

    [MaxLength(1000)]
    public string? AccessInstructions { get; set; }

    public string? Notes { get; set; }
}