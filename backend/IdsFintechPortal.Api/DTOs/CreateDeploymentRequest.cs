using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class CreateDeploymentRequest
{
    [Required]
    public int ClientId { get; set; }

    [Required]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(50)]
    public string ProductVersion { get; set; } = string.Empty;

    public DateTime? GoLiveDate { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? SupportTier { get; set; }

    public string? ClientSpecificNotes { get; set; }
}