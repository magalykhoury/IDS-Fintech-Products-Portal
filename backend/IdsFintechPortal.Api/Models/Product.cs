namespace IdsFintechPortal.Api.Models;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? BusinessPurpose { get; set; }

    public string LifecycleStatus { get; set; } = string.Empty;

    public string? CurrentVersion { get; set; }

    public string? SupportedMarkets { get; set; }

    public string? Criticality { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}