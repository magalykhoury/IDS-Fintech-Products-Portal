namespace IdsFintechPortal.Api.Models;

public class Document
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string DocumentType { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string UrlOrFileReference { get; set; } = string.Empty;

    public DateTime? LastUpdatedDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}