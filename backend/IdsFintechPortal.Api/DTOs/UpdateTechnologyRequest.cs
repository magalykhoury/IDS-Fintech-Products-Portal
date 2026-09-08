using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class UpdateTechnologyRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}