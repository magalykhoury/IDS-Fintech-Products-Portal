using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class CreateRepositoryRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string RepositoryUrl { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? MainBranch { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}