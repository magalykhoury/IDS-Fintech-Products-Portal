namespace IdsFintechPortal.Api.DTOs;

public class ProductTechnologyResponse
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int TechnologyId { get; set; }

    public string TechnologyName { get; set; } = string.Empty;

    public string? TechnologyDescription { get; set; }
}