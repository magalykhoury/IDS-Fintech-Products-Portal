namespace IdsFintechPortal.Api.DTOs;

public class ServerResponse
{
    public int Id { get; set; }

    public int EnvironmentId { get; set; }

    public string EnvironmentName { get; set; } = string.Empty;

    public int DeploymentId { get; set; }

    public int ClientId { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public string ServerName { get; set; } = string.Empty;

    public string? Hostname { get; set; }

    public string? IpAddress { get; set; }

    public string? ServerType { get; set; }

    public string? OperatingSystem { get; set; }

    public string? Purpose { get; set; }

    public string? AccessMethod { get; set; }

    public string? AccessReference { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}