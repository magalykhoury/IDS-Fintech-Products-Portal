using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class CreateClientRequest
{
    [Required]
    [MaxLength(200)]
    public string CompanyName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Country { get; set; }

    [MaxLength(150)]
    public string? ContactName { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? ContactEmail { get; set; }

    [MaxLength(50)]
    public string? ContactPhone { get; set; }

    [Required]
    [MaxLength(50)]
    [RegularExpression(
        "^(Active|Inactive)$",
        ErrorMessage = "Status must be Active or Inactive."
    )]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}