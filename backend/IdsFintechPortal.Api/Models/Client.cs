namespace IdsFintechPortal.Api.Models;

public class Client
{
    public int Id { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string? Country { get; set; }

    public string? ContactName { get; set; }

    public string? ContactEmail { get; set; }

    public string? ContactPhone { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}