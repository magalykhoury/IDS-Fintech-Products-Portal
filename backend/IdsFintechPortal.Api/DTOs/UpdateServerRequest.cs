using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class UpdateServerRequest
{
    [Required]
    public int EnvironmentId { get; set; }

    [Required]
    [MaxLength(150)]
    public string ServerName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Hostname { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [MaxLength(100)]
    public string? ServerType { get; set; }

    [MaxLength(150)]
    public string? OperatingSystem { get; set; }

    [MaxLength(500)]
    public string? Purpose { get; set; }

    [MaxLength(100)]
    public string? AccessMethod { get; set; }

    [MaxLength(500)]
    public string? AccessReference { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;
}