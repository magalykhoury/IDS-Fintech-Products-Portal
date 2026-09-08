using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class UpdateProductModuleRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;
}