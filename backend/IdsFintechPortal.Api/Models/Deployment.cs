namespace IdsFintechPortal.Api.Models;

public class Deployment
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public int ProductId { get; set; }

    public string ProductVersion { get; set; } = string.Empty;

    public DateTime? GoLiveDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? SupportTier { get; set; }

    public string? ClientSpecificNotes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}