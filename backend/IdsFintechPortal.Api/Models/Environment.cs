namespace IdsFintechPortal.Api.Models;

public class Environment
{
    public int Id { get; set; }

    public int DeploymentId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string? Purpose { get; set; }

    public string? ApplicationUrl { get; set; }

    public string? DatabaseInformation { get; set; }

    public string? MonitoringUrl { get; set; }

    public string? AccessInstructions { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}