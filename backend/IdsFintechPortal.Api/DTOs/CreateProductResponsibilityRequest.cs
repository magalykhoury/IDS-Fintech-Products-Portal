using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class CreateProductResponsibilityRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    public int TeamMemberId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Responsibility { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}
