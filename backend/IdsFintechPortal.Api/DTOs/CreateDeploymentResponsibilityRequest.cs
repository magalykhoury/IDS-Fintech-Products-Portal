using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class CreateDeploymentResponsibilityRequest
{
    [Required]
    public int DeploymentId { get; set; }

    [Required]
    public int TeamMemberId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Responsibility { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}