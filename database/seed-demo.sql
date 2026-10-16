-- IDS Fintech Products Portal - deterministic synthetic demo data
-- Supply private BCrypt hashes through the Demo*PasswordHash environment
-- variables documented in README.md. No shared demo passwords are published.
:ON ERROR EXIT

-- Supply the database name with sqlcmd, for example:
-- sqlcmd -S . -E -C -b -Q ":r database\seed-demo.sql" -v DatabaseName=IdsFintechPortal
USE [$(DatabaseName)];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
SET XACT_ABORT ON;
SET NOCOUNT ON;

-- Validate all supplied hashes before any data changes.
IF EXISTS (
    SELECT 1
    FROM (VALUES
        (N'$(DemoAdminPasswordHash)'),
        (N'$(DemoDeveloperPasswordHash)'),
        (N'$(DemoManagerPasswordHash)'),
        (N'$(DemoImplementationPasswordHash)'),
        (N'$(DemoViewerPasswordHash)')
    ) AS hashes(PasswordHash)
    WHERE DATALENGTH(PasswordHash) <> 120
       OR PasswordHash COLLATE Latin1_General_100_BIN2 NOT LIKE N'$2[aby]$[0-9][0-9]$%'
       OR SUBSTRING(PasswordHash, 8, 53) COLLATE Latin1_General_100_BIN2 LIKE N'%[^./A-Za-z0-9]%'
       OR TRY_CONVERT(int, SUBSTRING(PasswordHash, 5, 2)) NOT BETWEEN 4 AND 16
)
    THROW 50001, 'Supply valid private BCrypt hashes (cost 04-16) for all five demo accounts.', 1;

BEGIN TRANSACTION;

/* Roles and demo accounts. These rows are synthetic and carry no real
   employee data. Passwords are BCrypt hashes, never plaintext. */
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'Admin') INSERT dbo.Roles (Name, Description) VALUES (N'Admin', N'Full portal administration.');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'Management') INSERT dbo.Roles (Name, Description) VALUES (N'Management', N'General portal management.');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'ProductOwner') INSERT dbo.Roles (Name, Description) VALUES (N'ProductOwner', N'Product and deployment ownership.');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'Developer') INSERT dbo.Roles (Name, Description) VALUES (N'Developer', N'Product and deployment technical access.');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'QA') INSERT dbo.Roles (Name, Description) VALUES (N'QA', N'Read-oriented quality access.');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'Implementation') INSERT dbo.Roles (Name, Description) VALUES (N'Implementation', N'Deployment implementation access.');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'Support') INSERT dbo.Roles (Name, Description) VALUES (N'Support', N'Read-oriented support access.');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Name = N'Viewer') INSERT dbo.Roles (Name, Description) VALUES (N'Viewer', N'Read-only portal access.');

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = N'demo.admin')
    INSERT dbo.Users (Username, Email, PasswordHash, RoleId, IsActive) VALUES (N'demo.admin', N'demo.admin@demo.ids.local', N'$(DemoAdminPasswordHash)', (SELECT Id FROM dbo.Roles WHERE Name = N'Admin'), 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = N'demo.developer')
    INSERT dbo.Users (Username, Email, PasswordHash, RoleId, IsActive) VALUES (N'demo.developer', N'demo.developer@demo.ids.local', N'$(DemoDeveloperPasswordHash)', (SELECT Id FROM dbo.Roles WHERE Name = N'Developer'), 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = N'demo.manager')
    INSERT dbo.Users (Username, Email, PasswordHash, RoleId, IsActive) VALUES (N'demo.manager', N'demo.manager@demo.ids.local', N'$(DemoManagerPasswordHash)', (SELECT Id FROM dbo.Roles WHERE Name = N'Management'), 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = N'demo.implementation')
    INSERT dbo.Users (Username, Email, PasswordHash, RoleId, IsActive) VALUES (N'demo.implementation', N'demo.implementation@demo.ids.local', N'$(DemoImplementationPasswordHash)', (SELECT Id FROM dbo.Roles WHERE Name = N'Implementation'), 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = N'demo.viewer')
    INSERT dbo.Users (Username, Email, PasswordHash, RoleId, IsActive) VALUES (N'demo.viewer', N'demo.viewer@demo.ids.local', N'$(DemoViewerPasswordHash)', (SELECT Id FROM dbo.Roles WHERE Name = N'Viewer'), 1);

/* Products */
IF EXISTS (SELECT 1 FROM dbo.Products WHERE Id = 1 AND Name = N'Product X')
    UPDATE dbo.Products SET Name = N'Atlas Payments Platform' WHERE Id = 1;
IF EXISTS (SELECT 1 FROM dbo.Products WHERE Id = 3 AND Name = N'Product Z')
    UPDATE dbo.Products SET Name = N'Northstar Risk Services' WHERE Id = 3;

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'Atlas Payments Platform')
    INSERT dbo.Products (Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion, SupportedMarkets, Criticality, Notes)
    VALUES (N'Atlas Payments Platform', N'Payment processing and settlement operations for institutional clients.', N'Coordinate payment intake, settlement workflows, and operational reporting.', N'Active', N'3.2', N'Levant, Gulf', N'High', N'Synthetic demonstration product.');

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'Northstar Risk Services')
    INSERT dbo.Products (Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion, SupportedMarkets, Criticality, Notes)
    VALUES (N'Northstar Risk Services', N'Configurable risk screening and case-review workflows.', N'Support pre-transaction screening and operational risk review.', N'Maintenance', N'2.8', N'MENA', N'Medium', N'Synthetic demonstration product.');

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'Meridian Reconciliation Hub')
    INSERT dbo.Products (Name, Description, BusinessPurpose, LifecycleStatus, CurrentVersion, SupportedMarkets, Criticality, Notes)
    VALUES (N'Meridian Reconciliation Hub', N'Reconciliation workspace for settlement files and exception handling.', N'Compare settlement activity with internal records and surface exceptions.', N'Planned', N'1.4', N'Regional pilots', N'Low', N'Synthetic demonstration product.');

DECLARE @AtlasProductId int = (SELECT Id FROM dbo.Products WHERE Name = N'Atlas Payments Platform');
DECLARE @NorthstarProductId int = (SELECT Id FROM dbo.Products WHERE Name = N'Northstar Risk Services');
DECLARE @MeridianProductId int = (SELECT Id FROM dbo.Products WHERE Name = N'Meridian Reconciliation Hub');

UPDATE dbo.Products
SET Description = N'Payment processing and settlement operations for institutional clients.', BusinessPurpose = N'Coordinate payment intake, settlement workflows, and operational reporting.', LifecycleStatus = N'Active', CurrentVersion = N'3.2', SupportedMarkets = N'Levant, Gulf', Criticality = N'High', Notes = N'Synthetic demonstration product.'
WHERE Id = @AtlasProductId;
UPDATE dbo.Products
SET Description = N'Configurable risk screening and case-review workflows.', BusinessPurpose = N'Support pre-transaction screening and operational risk review.', LifecycleStatus = N'Maintenance', CurrentVersion = N'2.8', SupportedMarkets = N'MENA', Criticality = N'Medium', Notes = N'Synthetic demonstration product.'
WHERE Id = @NorthstarProductId;
UPDATE dbo.Products
SET Description = N'Reconciliation workspace for settlement files and exception handling.', BusinessPurpose = N'Compare settlement activity with internal records and surface exceptions.', LifecycleStatus = N'Planned', CurrentVersion = N'1.4', SupportedMarkets = N'Regional pilots', Criticality = N'Low', Notes = N'Synthetic demonstration product.'
WHERE Id = @MeridianProductId;

/* Clients */
IF EXISTS (SELECT 1 FROM dbo.Clients WHERE Id = 1 AND CompanyName = N'Client A')
    UPDATE dbo.Clients SET CompanyName = N'Cedar Ridge Bank' WHERE Id = 1;

IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE CompanyName = N'Cedar Ridge Bank')
    INSERT dbo.Clients (CompanyName, Country, ContactName, ContactEmail, ContactPhone, Status, Notes)
    VALUES (N'Cedar Ridge Bank', N'Lebanon', N'Mira Haddad', N'mira.haddad@cedarridge.demo', N'+961 70 555 210', N'Active', N'Synthetic demonstration client.');
IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE CompanyName = N'Harborline Finance')
    INSERT dbo.Clients (CompanyName, Country, ContactName, ContactEmail, ContactPhone, Status, Notes)
    VALUES (N'Harborline Finance', N'Jordan', N'Samir Nasser', N'samir.nasser@harborline.demo', N'+962 79 555 318', N'Active', N'Synthetic demonstration client.');
IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE CompanyName = N'Summit Cooperative')
    INSERT dbo.Clients (CompanyName, Country, ContactName, ContactEmail, ContactPhone, Status, Notes)
    VALUES (N'Summit Cooperative', N'United Arab Emirates', N'Rana Saleh', N'rana.saleh@summitcooperative.demo', N'+971 50 555 427', N'Onboarding', N'Synthetic demonstration client.');

DECLARE @CedarClientId int = (SELECT Id FROM dbo.Clients WHERE CompanyName = N'Cedar Ridge Bank');
DECLARE @HarborlineClientId int = (SELECT Id FROM dbo.Clients WHERE CompanyName = N'Harborline Finance');
DECLARE @SummitClientId int = (SELECT Id FROM dbo.Clients WHERE CompanyName = N'Summit Cooperative');

/* Technologies */
IF NOT EXISTS (SELECT 1 FROM dbo.Technologies WHERE Name = N'.NET')
    INSERT dbo.Technologies (Name, Description) VALUES (N'.NET', N'Backend development platform');
IF NOT EXISTS (SELECT 1 FROM dbo.Technologies WHERE Name = N'React')
    INSERT dbo.Technologies (Name, Description) VALUES (N'React', N'Frontend application library');
IF NOT EXISTS (SELECT 1 FROM dbo.Technologies WHERE Name = N'SQL Server')
    INSERT dbo.Technologies (Name, Description) VALUES (N'SQL Server', N'Relational database platform');
UPDATE dbo.Technologies SET Description = N'Backend development platform' WHERE Name = N'.NET';
UPDATE dbo.Technologies SET Description = N'Frontend application library' WHERE Name = N'React';
UPDATE dbo.Technologies SET Description = N'Relational database platform' WHERE Name = N'SQL Server';
IF NOT EXISTS (SELECT 1 FROM dbo.Technologies WHERE Name = N'TypeScript')
    INSERT dbo.Technologies (Name, Description) VALUES (N'TypeScript', N'Typed frontend development language.');
IF NOT EXISTS (SELECT 1 FROM dbo.Technologies WHERE Name = N'Redis')
    INSERT dbo.Technologies (Name, Description) VALUES (N'Redis', N'Caching and transient coordination store.');
IF NOT EXISTS (SELECT 1 FROM dbo.Technologies WHERE Name = N'OpenTelemetry')
    INSERT dbo.Technologies (Name, Description) VALUES (N'OpenTelemetry', N'Application observability instrumentation.');

DECLARE @DotnetTechnologyId int = (SELECT Id FROM dbo.Technologies WHERE Name = N'.NET');
DECLARE @ReactTechnologyId int = (SELECT Id FROM dbo.Technologies WHERE Name = N'React');
DECLARE @SqlTechnologyId int = (SELECT Id FROM dbo.Technologies WHERE Name = N'SQL Server');
DECLARE @TypeScriptTechnologyId int = (SELECT Id FROM dbo.Technologies WHERE Name = N'TypeScript');
DECLARE @RedisTechnologyId int = (SELECT Id FROM dbo.Technologies WHERE Name = N'Redis');
DECLARE @TelemetryTechnologyId int = (SELECT Id FROM dbo.Technologies WHERE Name = N'OpenTelemetry');

/* Team */
IF EXISTS (SELECT 1 FROM dbo.TeamMembers WHERE Id = 1 AND FullName = N'Employee A')
    UPDATE dbo.TeamMembers SET FullName = N'Lina Haddad', JobTitle = N'Senior Software Engineer', Department = N'Platform Engineering', Email = N'lina.haddad@demo.ids.local', Status = N'Active' WHERE Id = 1;
IF NOT EXISTS (SELECT 1 FROM dbo.TeamMembers WHERE FullName = N'Lina Haddad')
    INSERT dbo.TeamMembers (FullName, JobTitle, Department, Email, Status) VALUES (N'Lina Haddad', N'Senior Software Engineer', N'Platform Engineering', N'lina.haddad@demo.ids.local', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.TeamMembers WHERE FullName = N'Omar Nasser')
    INSERT dbo.TeamMembers (FullName, JobTitle, Department, Email, Status) VALUES (N'Omar Nasser', N'Product Owner', N'Product Operations', N'omar.nasser@demo.ids.local', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.TeamMembers WHERE FullName = N'Maya Saleh')
    INSERT dbo.TeamMembers (FullName, JobTitle, Department, Email, Status) VALUES (N'Maya Saleh', N'QA Lead', N'Quality Engineering', N'maya.saleh@demo.ids.local', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.TeamMembers WHERE FullName = N'Tariq Mansour')
    INSERT dbo.TeamMembers (FullName, JobTitle, Department, Email, Status) VALUES (N'Tariq Mansour', N'Implementation Engineer', N'Client Delivery', N'tariq.mansour@demo.ids.local', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.TeamMembers WHERE FullName = N'Nora Khoury')
    INSERT dbo.TeamMembers (FullName, JobTitle, Department, Email, Status) VALUES (N'Nora Khoury', N'Support Engineer', N'Operations', N'nora.khoury@demo.ids.local', N'Active');

DECLARE @LinaId int = (SELECT Id FROM dbo.TeamMembers WHERE FullName = N'Lina Haddad');
DECLARE @OmarId int = (SELECT Id FROM dbo.TeamMembers WHERE FullName = N'Omar Nasser');
DECLARE @MayaId int = (SELECT Id FROM dbo.TeamMembers WHERE FullName = N'Maya Saleh');
DECLARE @TariqId int = (SELECT Id FROM dbo.TeamMembers WHERE FullName = N'Tariq Mansour');
DECLARE @NoraId int = (SELECT Id FROM dbo.TeamMembers WHERE FullName = N'Nora Khoury');

/* Product technologies */
INSERT dbo.ProductTechnologies (ProductId, TechnologyId)
SELECT @AtlasProductId, v.TechnologyId FROM (VALUES (@DotnetTechnologyId), (@ReactTechnologyId), (@SqlTechnologyId), (@TypeScriptTechnologyId)) v(TechnologyId)
WHERE NOT EXISTS (SELECT 1 FROM dbo.ProductTechnologies x WHERE x.ProductId = @AtlasProductId AND x.TechnologyId = v.TechnologyId);
INSERT dbo.ProductTechnologies (ProductId, TechnologyId)
SELECT @NorthstarProductId, v.TechnologyId FROM (VALUES (@DotnetTechnologyId), (@ReactTechnologyId), (@RedisTechnologyId), (@TelemetryTechnologyId)) v(TechnologyId)
WHERE NOT EXISTS (SELECT 1 FROM dbo.ProductTechnologies x WHERE x.ProductId = @NorthstarProductId AND x.TechnologyId = v.TechnologyId);
INSERT dbo.ProductTechnologies (ProductId, TechnologyId)
SELECT @MeridianProductId, v.TechnologyId FROM (VALUES (@DotnetTechnologyId), (@ReactTechnologyId), (@SqlTechnologyId), (@TelemetryTechnologyId)) v(TechnologyId)
WHERE NOT EXISTS (SELECT 1 FROM dbo.ProductTechnologies x WHERE x.ProductId = @MeridianProductId AND x.TechnologyId = v.TechnologyId);

/* Product modules */
IF EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Core Module')
    UPDATE dbo.ProductModules SET Name = N'Payment Orchestration', Description = N'Coordinates payment intake and settlement workflow.', Status = N'Active' WHERE ProductId = @AtlasProductId AND Name = N'Core Module';
IF EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Reporting Module')
    UPDATE dbo.ProductModules SET Name = N'Settlement Reporting', Description = N'Provides operational settlement and exception reporting.', Status = N'Active' WHERE ProductId = @AtlasProductId AND Name = N'Reporting Module';
IF EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Integration Module')
    UPDATE dbo.ProductModules SET Name = N'Partner Gateway', Description = N'Manages partner and client integration channels.', Status = N'Active' WHERE ProductId = @AtlasProductId AND Name = N'Integration Module';
IF NOT EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Payment Orchestration')
    INSERT dbo.ProductModules (ProductId, Name, Description, Status) VALUES (@AtlasProductId, N'Payment Orchestration', N'Coordinates payment intake and settlement workflow.', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Settlement Reporting')
    INSERT dbo.ProductModules (ProductId, Name, Description, Status) VALUES (@AtlasProductId, N'Settlement Reporting', N'Provides operational settlement and exception reporting.', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Partner Gateway')
    INSERT dbo.ProductModules (ProductId, Name, Description, Status) VALUES (@AtlasProductId, N'Partner Gateway', N'Manages partner and client integration channels.', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @NorthstarProductId AND Name = N'Risk Rules')
    INSERT dbo.ProductModules (ProductId, Name, Description, Status) VALUES (@NorthstarProductId, N'Risk Rules', N'Configurable screening rules and thresholds.', N'Maintenance');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @NorthstarProductId AND Name = N'Case Review')
    INSERT dbo.ProductModules (ProductId, Name, Description, Status) VALUES (@NorthstarProductId, N'Case Review', N'Operational review queue for flagged activity.', N'Active');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @MeridianProductId AND Name = N'Reconciliation Engine')
    INSERT dbo.ProductModules (ProductId, Name, Description, Status) VALUES (@MeridianProductId, N'Reconciliation Engine', N'Matches settlement files against internal records.', N'Planned');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductModules WHERE ProductId = @MeridianProductId AND Name = N'Exception Export')
    INSERT dbo.ProductModules (ProductId, Name, Description, Status) VALUES (@MeridianProductId, N'Exception Export', N'Exports reconciliation exceptions for operational review.', N'Planned');

/* Deployments */
UPDATE dbo.Deployments SET ClientId = @CedarClientId, ProductId = @AtlasProductId, ProductVersion = N'3.2', GoLiveDate = '2026-08-01', Status = N'Production', SupportTier = N'Enhanced', ClientSpecificNotes = N'Primary synthetic production deployment for the demonstration.' WHERE Id = 1;
IF NOT EXISTS (SELECT 1 FROM dbo.Deployments WHERE ClientId = @CedarClientId AND ProductId = @AtlasProductId AND ProductVersion = N'3.2')
    INSERT dbo.Deployments (ClientId, ProductId, ProductVersion, GoLiveDate, Status, SupportTier, ClientSpecificNotes) VALUES (@CedarClientId, @AtlasProductId, N'3.2', '2026-08-01', N'Production', N'Enhanced', N'Primary synthetic production deployment for the demonstration.');

IF NOT EXISTS (SELECT 1 FROM dbo.Deployments WHERE ClientId = @HarborlineClientId AND ProductId = @AtlasProductId AND ProductVersion = N'3.1')
    INSERT dbo.Deployments (ClientId, ProductId, ProductVersion, GoLiveDate, Status, SupportTier, ClientSpecificNotes) VALUES (@HarborlineClientId, @AtlasProductId, N'3.1', '2026-05-15', N'Production', N'Standard', N'Synthetic production deployment.');
IF NOT EXISTS (SELECT 1 FROM dbo.Deployments WHERE ClientId = @CedarClientId AND ProductId = @NorthstarProductId AND ProductVersion = N'2.8')
    INSERT dbo.Deployments (ClientId, ProductId, ProductVersion, GoLiveDate, Status, SupportTier, ClientSpecificNotes) VALUES (@CedarClientId, @NorthstarProductId, N'2.8', '2026-09-10', N'UAT', N'Standard', N'Synthetic UAT deployment for the risk workflow.');
IF NOT EXISTS (SELECT 1 FROM dbo.Deployments WHERE ClientId = @SummitClientId AND ProductId = @MeridianProductId AND ProductVersion = N'1.4')
    INSERT dbo.Deployments (ClientId, ProductId, ProductVersion, GoLiveDate, Status, SupportTier, ClientSpecificNotes) VALUES (@SummitClientId, @MeridianProductId, N'1.4', '2026-10-01', N'Testing', N'Pilot', N'Synthetic pilot deployment.');
IF NOT EXISTS (SELECT 1 FROM dbo.Deployments WHERE ClientId = @HarborlineClientId AND ProductId = @NorthstarProductId AND ProductVersion = N'2.8')
    INSERT dbo.Deployments (ClientId, ProductId, ProductVersion, GoLiveDate, Status, SupportTier, ClientSpecificNotes) VALUES (@HarborlineClientId, @NorthstarProductId, N'2.8', '2026-07-20', N'Production', N'Enhanced', N'Synthetic risk-service deployment.');

DECLARE @AtlasCedarDeploymentId int = (SELECT TOP 1 Id FROM dbo.Deployments WHERE ClientId = @CedarClientId AND ProductId = @AtlasProductId ORDER BY Id);
DECLARE @AtlasHarborlineDeploymentId int = (SELECT Id FROM dbo.Deployments WHERE ClientId = @HarborlineClientId AND ProductId = @AtlasProductId AND ProductVersion = N'3.1');
DECLARE @NorthstarCedarDeploymentId int = (SELECT Id FROM dbo.Deployments WHERE ClientId = @CedarClientId AND ProductId = @NorthstarProductId AND ProductVersion = N'2.8');
DECLARE @MeridianSummitDeploymentId int = (SELECT Id FROM dbo.Deployments WHERE ClientId = @SummitClientId AND ProductId = @MeridianProductId AND ProductVersion = N'1.4');
DECLARE @NorthstarHarborlineDeploymentId int = (SELECT Id FROM dbo.Deployments WHERE ClientId = @HarborlineClientId AND ProductId = @NorthstarProductId AND ProductVersion = N'2.8');

/* Environments */
UPDATE dbo.Environments SET Name = N'UAT', Type = N'UAT', Purpose = N'Business acceptance testing for the primary deployment.', ApplicationUrl = N'https://uat.atlas.demo.local', DatabaseInformation = N'Synthetic UAT database reference', MonitoringUrl = N'https://monitoring.demo.local/atlas-uat', AccessInstructions = N'Use the approved internal access process.', Notes = N'No credentials are stored here.' WHERE DeploymentId = @AtlasCedarDeploymentId AND Name = N'UAT';
UPDATE dbo.Environments SET Name = N'Production', Type = N'Production', Purpose = N'Live synthetic production environment.', ApplicationUrl = N'https://atlas.demo.local', DatabaseInformation = N'Synthetic production database reference', MonitoringUrl = N'https://monitoring.demo.local/atlas-production', AccessInstructions = N'Use the approved internal access process.', Notes = N'No credentials are stored here.' WHERE DeploymentId = @AtlasCedarDeploymentId AND Name = N'Production';

IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @AtlasCedarDeploymentId AND Name = N'UAT')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@AtlasCedarDeploymentId, N'UAT', N'UAT', N'Business acceptance testing for the primary deployment.', N'https://uat.atlas.demo.local', N'Synthetic UAT database reference', N'https://monitoring.demo.local/atlas-uat', N'Use the approved internal access process.', N'No credentials are stored here.');
IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @AtlasCedarDeploymentId AND Name = N'Production')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@AtlasCedarDeploymentId, N'Production', N'Production', N'Live synthetic production environment.', N'https://atlas.demo.local', N'Synthetic production database reference', N'https://monitoring.demo.local/atlas-production', N'Use the approved internal access process.', N'No credentials are stored here.');

IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @AtlasHarborlineDeploymentId AND Name = N'Production')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@AtlasHarborlineDeploymentId, N'Production', N'Production', N'Live synthetic production environment.', N'https://harborline-atlas.demo.local', N'Synthetic production database reference', N'https://monitoring.demo.local/harborline-atlas', N'Use the approved internal access process.', N'No credentials are stored here.');
IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @NorthstarCedarDeploymentId AND Name = N'UAT')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@NorthstarCedarDeploymentId, N'UAT', N'UAT', N'Risk workflow acceptance testing.', N'https://uat.northstar.demo.local', N'Synthetic UAT database reference', N'https://monitoring.demo.local/northstar-uat', N'Use the approved internal access process.', N'No credentials are stored here.');
IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @NorthstarCedarDeploymentId AND Name = N'Production')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@NorthstarCedarDeploymentId, N'Production', N'Production', N'Production risk screening environment.', N'https://northstar.demo.local', N'Synthetic production database reference', N'https://monitoring.demo.local/northstar-production', N'Use the approved internal access process.', N'No credentials are stored here.');
IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @MeridianSummitDeploymentId AND Name = N'Testing')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@MeridianSummitDeploymentId, N'Testing', N'Testing', N'Integration and reconciliation testing.', N'https://test.meridian.demo.local', N'Synthetic testing database reference', N'https://monitoring.demo.local/meridian-test', N'Use the approved internal access process.', N'No credentials are stored here.');
IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @MeridianSummitDeploymentId AND Name = N'UAT')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@MeridianSummitDeploymentId, N'UAT', N'UAT', N'Business acceptance testing for reconciliation workflows.', N'https://uat.meridian.demo.local', N'Synthetic UAT database reference', N'https://monitoring.demo.local/meridian-uat', N'Use the approved internal access process.', N'No credentials are stored here.');
IF NOT EXISTS (SELECT 1 FROM dbo.Environments WHERE DeploymentId = @NorthstarHarborlineDeploymentId AND Name = N'Production')
    INSERT dbo.Environments (DeploymentId, Name, Type, Purpose, ApplicationUrl, DatabaseInformation, MonitoringUrl, AccessInstructions, Notes) VALUES (@NorthstarHarborlineDeploymentId, N'Production', N'Production', N'Production risk screening environment.', N'https://harborline-northstar.demo.local', N'Synthetic production database reference', N'https://monitoring.demo.local/harborline-northstar', N'Use the approved internal access process.', N'No credentials are stored here.');

/* Servers */
UPDATE dbo.Servers SET ServerName = N'Cedar-UAT-APP01', Hostname = N'cedar-uat-app01.demo.local', IpAddress = N'10.20.1.11', ServerType = N'Application', OperatingSystem = N'Windows Server 2022', Purpose = N'Atlas UAT application host', AccessMethod = N'Approved internal access process', AccessReference = N'OPS-ATLAS-CEDAR-UAT', Notes = N'Synthetic reference only.', IsActive = 1 WHERE Id = 1;
UPDATE dbo.Servers SET ServerName = N'Cedar-PROD-APP01', Hostname = N'cedar-prod-app01.demo.local', IpAddress = N'10.20.2.11', ServerType = N'Application', OperatingSystem = N'Windows Server 2022', Purpose = N'Atlas production application host', AccessMethod = N'Approved internal access process', AccessReference = N'OPS-ATLAS-CEDAR-PROD', Notes = N'Synthetic reference only.', IsActive = 1 WHERE Id = 2;
UPDATE dbo.Servers SET ServerName = N'Cedar-PROD-DB01', Hostname = N'cedar-prod-db01.demo.local', IpAddress = N'10.20.2.21', ServerType = N'Database', OperatingSystem = N'Windows Server 2022', Purpose = N'Atlas production database host', AccessMethod = N'Approved internal access process', AccessReference = N'OPS-ATLAS-CEDAR-DB', Notes = N'Synthetic reference only.', IsActive = 1 WHERE Id = 3;

DECLARE @AtlasCedarUatId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @AtlasCedarDeploymentId AND Name = N'UAT');
DECLARE @AtlasCedarProdId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @AtlasCedarDeploymentId AND Name = N'Production');
DECLARE @AtlasHarborlineProdId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @AtlasHarborlineDeploymentId AND Name = N'Production');
DECLARE @NorthstarCedarUatId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @NorthstarCedarDeploymentId AND Name = N'UAT');
DECLARE @NorthstarCedarProdId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @NorthstarCedarDeploymentId AND Name = N'Production');
DECLARE @MeridianSummitTestId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @MeridianSummitDeploymentId AND Name = N'Testing');
DECLARE @MeridianSummitUatId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @MeridianSummitDeploymentId AND Name = N'UAT');
DECLARE @NorthstarHarborlineProdId int = (SELECT Id FROM dbo.Environments WHERE DeploymentId = @NorthstarHarborlineDeploymentId AND Name = N'Production');

INSERT dbo.Servers (EnvironmentId, ServerName, Hostname, IpAddress, ServerType, OperatingSystem, Purpose, AccessMethod, AccessReference, Notes, IsActive)
SELECT v.EnvironmentId, v.ServerName, v.Hostname, v.IpAddress, v.ServerType, v.OperatingSystem, v.Purpose, N'Approved internal access process', v.AccessReference, N'Synthetic reference only.', 1
FROM (VALUES
    (@AtlasCedarUatId, N'Cedar-UAT-APP01', N'cedar-uat-app01.demo.local', N'10.20.1.11', N'Application', N'Windows Server 2022', N'Atlas UAT application host', N'OPS-ATLAS-CEDAR-UAT'),
    (@AtlasCedarProdId, N'Cedar-PROD-APP01', N'cedar-prod-app01.demo.local', N'10.20.2.11', N'Application', N'Windows Server 2022', N'Atlas production application host', N'OPS-ATLAS-CEDAR-PROD'),
    (@AtlasCedarProdId, N'Cedar-PROD-DB01', N'cedar-prod-db01.demo.local', N'10.20.2.21', N'Database', N'Windows Server 2022', N'Atlas production database host', N'OPS-ATLAS-CEDAR-DB'),
    (@AtlasHarborlineProdId, N'Harborline-PROD-APP01', N'harborline-prod-app01.demo.local', N'10.30.2.11', N'Application', N'Ubuntu 24.04 LTS', N'Atlas production application host', N'OPS-ATLAS-HARBORLINE-PROD'),
    (@NorthstarCedarUatId, N'Cedar-RISK-UAT01', N'cedar-risk-uat01.demo.local', N'10.40.1.11', N'Application', N'Ubuntu 24.04 LTS', N'Northstar UAT application host', N'OPS-NORTHSTAR-CEDAR-UAT'),
    (@NorthstarCedarProdId, N'Cedar-RISK-PROD01', N'cedar-risk-prod01.demo.local', N'10.40.2.11', N'Application', N'Ubuntu 24.04 LTS', N'Northstar production application host', N'OPS-NORTHSTAR-CEDAR-PROD'),
    (@MeridianSummitTestId, N'Summit-REC-TEST01', N'summit-rec-test01.demo.local', N'10.50.1.11', N'Application', N'Windows Server 2022', N'Meridian testing application host', N'OPS-MERIDIAN-SUMMIT-TEST'),
    (@MeridianSummitUatId, N'Summit-REC-UAT01', N'summit-rec-uat01.demo.local', N'10.50.2.11', N'Application', N'Windows Server 2022', N'Meridian UAT application host', N'OPS-MERIDIAN-SUMMIT-UAT'),
    (@NorthstarHarborlineProdId, N'Harborline-RISK-PROD01', N'harborline-risk-prod01.demo.local', N'10.60.2.11', N'Application', N'Ubuntu 24.04 LTS', N'Northstar production application host', N'OPS-NORTHSTAR-HARBORLINE')
) v(EnvironmentId, ServerName, Hostname, IpAddress, ServerType, OperatingSystem, Purpose, AccessReference)
WHERE v.EnvironmentId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.Servers s WHERE s.EnvironmentId = v.EnvironmentId AND s.ServerName = v.ServerName);

/* Enabled deployment modules */
DECLARE @AtlasPaymentModuleId int = (SELECT Id FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Payment Orchestration');
DECLARE @AtlasReportingModuleId int = (SELECT Id FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Settlement Reporting');
DECLARE @AtlasGatewayModuleId int = (SELECT Id FROM dbo.ProductModules WHERE ProductId = @AtlasProductId AND Name = N'Partner Gateway');
DECLARE @NorthstarRulesModuleId int = (SELECT Id FROM dbo.ProductModules WHERE ProductId = @NorthstarProductId AND Name = N'Risk Rules');
DECLARE @NorthstarCaseModuleId int = (SELECT Id FROM dbo.ProductModules WHERE ProductId = @NorthstarProductId AND Name = N'Case Review');
DECLARE @MeridianEngineModuleId int = (SELECT Id FROM dbo.ProductModules WHERE ProductId = @MeridianProductId AND Name = N'Reconciliation Engine');

INSERT dbo.DeploymentModules (DeploymentId, ProductModuleId)
SELECT v.DeploymentId, v.ProductModuleId FROM (VALUES (@AtlasCedarDeploymentId, @AtlasPaymentModuleId), (@AtlasCedarDeploymentId, @AtlasReportingModuleId), (@AtlasCedarDeploymentId, @AtlasGatewayModuleId), (@AtlasHarborlineDeploymentId, @AtlasPaymentModuleId), (@AtlasHarborlineDeploymentId, @AtlasGatewayModuleId), (@NorthstarCedarDeploymentId, @NorthstarRulesModuleId), (@NorthstarCedarDeploymentId, @NorthstarCaseModuleId), (@NorthstarHarborlineDeploymentId, @NorthstarRulesModuleId), (@MeridianSummitDeploymentId, @MeridianEngineModuleId)) v(DeploymentId, ProductModuleId)
WHERE v.DeploymentId IS NOT NULL AND v.ProductModuleId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.DeploymentModules x WHERE x.DeploymentId = v.DeploymentId AND x.ProductModuleId = v.ProductModuleId);

/* Repositories and documents */
UPDATE dbo.Repositories SET ProductId = @AtlasProductId, Name = N'Atlas Payments API', RepositoryUrl = N'https://github.com/ids-fintech-demo/atlas-payments-api', MainBranch = N'main', Description = N'Synthetic repository reference for the Atlas backend.' WHERE Id = 1;
UPDATE dbo.Documents SET ProductId = @AtlasProductId, Name = N'Atlas Platform Operations Guide', DocumentType = N'Technical Documentation', Description = N'Synthetic operations reference for the Atlas platform.', UrlOrFileReference = N'https://docs.ids-fintech-demo.local/atlas/operations', LastUpdatedDate = '2026-09-01' WHERE Id = 1;
IF NOT EXISTS (SELECT 1 FROM dbo.Repositories WHERE ProductId = @AtlasProductId AND Name = N'Atlas Payments API')
    INSERT dbo.Repositories (ProductId, Name, RepositoryUrl, MainBranch, Description) VALUES (@AtlasProductId, N'Atlas Payments API', N'https://github.com/ids-fintech-demo/atlas-payments-api', N'main', N'Synthetic repository reference for the Atlas backend.');
IF NOT EXISTS (SELECT 1 FROM dbo.Documents WHERE ProductId = @AtlasProductId AND Name = N'Atlas Platform Operations Guide')
    INSERT dbo.Documents (ProductId, Name, DocumentType, Description, UrlOrFileReference, LastUpdatedDate) VALUES (@AtlasProductId, N'Atlas Platform Operations Guide', N'Technical Documentation', N'Synthetic operations reference for the Atlas platform.', N'https://docs.ids-fintech-demo.local/atlas/operations', '2026-09-01');
IF NOT EXISTS (SELECT 1 FROM dbo.Repositories WHERE ProductId = @AtlasProductId AND Name = N'Atlas Web Console')
    INSERT dbo.Repositories (ProductId, Name, RepositoryUrl, MainBranch, Description) VALUES (@AtlasProductId, N'Atlas Web Console', N'https://github.com/ids-fintech-demo/atlas-web-console', N'main', N'Synthetic repository reference for the portal frontend.');
IF NOT EXISTS (SELECT 1 FROM dbo.Repositories WHERE ProductId = @NorthstarProductId AND Name = N'Northstar Risk Engine')
    INSERT dbo.Repositories (ProductId, Name, RepositoryUrl, MainBranch, Description) VALUES (@NorthstarProductId, N'Northstar Risk Engine', N'https://github.com/ids-fintech-demo/northstar-risk-engine', N'main', N'Synthetic repository reference for the risk service.');
IF NOT EXISTS (SELECT 1 FROM dbo.Documents WHERE ProductId = @NorthstarProductId AND Name = N'Northstar Deployment Guide')
    INSERT dbo.Documents (ProductId, Name, DocumentType, Description, UrlOrFileReference, LastUpdatedDate) VALUES (@NorthstarProductId, N'Northstar Deployment Guide', N'Deployment Guide', N'Synthetic deployment reference for Northstar environments.', N'https://docs.ids-fintech-demo.local/northstar/deployment', '2026-08-22');
IF NOT EXISTS (SELECT 1 FROM dbo.Documents WHERE ProductId = @MeridianProductId AND Name = N'Meridian Reconciliation Notes')
    INSERT dbo.Documents (ProductId, Name, DocumentType, Description, UrlOrFileReference, LastUpdatedDate) VALUES (@MeridianProductId, N'Meridian Reconciliation Notes', N'Functional Documentation', N'Synthetic functional reference for reconciliation workflows.', N'https://docs.ids-fintech-demo.local/meridian/reconciliation', '2026-08-18');

/* Responsibilities */
IF NOT EXISTS (SELECT 1 FROM dbo.ProductResponsibilities WHERE ProductId = @AtlasProductId AND TeamMemberId = @LinaId AND Responsibility = N'Technical Owner')
    INSERT dbo.ProductResponsibilities (ProductId, TeamMemberId, Responsibility, Description) VALUES (@AtlasProductId, @LinaId, N'Technical Owner', N'Owns the platform technical direction.');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductResponsibilities WHERE ProductId = @AtlasProductId AND TeamMemberId = @OmarId AND Responsibility = N'Product Owner')
    INSERT dbo.ProductResponsibilities (ProductId, TeamMemberId, Responsibility, Description) VALUES (@AtlasProductId, @OmarId, N'Product Owner', N'Coordinates product priorities and release planning.');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductResponsibilities WHERE ProductId = @NorthstarProductId AND TeamMemberId = @LinaId AND Responsibility = N'Service Lead')
    INSERT dbo.ProductResponsibilities (ProductId, TeamMemberId, Responsibility, Description) VALUES (@NorthstarProductId, @LinaId, N'Service Lead', N'Owns service reliability and technical decisions.');
IF NOT EXISTS (SELECT 1 FROM dbo.ProductResponsibilities WHERE ProductId = @MeridianProductId AND TeamMemberId = @OmarId AND Responsibility = N'Product Sponsor')
    INSERT dbo.ProductResponsibilities (ProductId, TeamMemberId, Responsibility, Description) VALUES (@MeridianProductId, @OmarId, N'Product Sponsor', N'Coordinates the pilot scope and stakeholder priorities.');

IF NOT EXISTS (SELECT 1 FROM dbo.DeploymentResponsibilities WHERE DeploymentId = @AtlasCedarDeploymentId AND TeamMemberId = @TariqId AND Responsibility = N'Deployment Lead')
    INSERT dbo.DeploymentResponsibilities (DeploymentId, TeamMemberId, Responsibility, Description) VALUES (@AtlasCedarDeploymentId, @TariqId, N'Deployment Lead', N'Coordinates client deployment readiness.');
IF NOT EXISTS (SELECT 1 FROM dbo.DeploymentResponsibilities WHERE DeploymentId = @AtlasCedarDeploymentId AND TeamMemberId = @NoraId AND Responsibility = N'Operational Support')
    INSERT dbo.DeploymentResponsibilities (DeploymentId, TeamMemberId, Responsibility, Description) VALUES (@AtlasCedarDeploymentId, @NoraId, N'Operational Support', N'Coordinates operational support coverage.');
IF NOT EXISTS (SELECT 1 FROM dbo.DeploymentResponsibilities WHERE DeploymentId = @NorthstarCedarDeploymentId AND TeamMemberId = @MayaId AND Responsibility = N'UAT Coordinator')
    INSERT dbo.DeploymentResponsibilities (DeploymentId, TeamMemberId, Responsibility, Description) VALUES (@NorthstarCedarDeploymentId, @MayaId, N'UAT Coordinator', N'Coordinates acceptance testing and sign-off.');
IF NOT EXISTS (SELECT 1 FROM dbo.DeploymentResponsibilities WHERE DeploymentId = @MeridianSummitDeploymentId AND TeamMemberId = @TariqId AND Responsibility = N'Implementation Lead')
    INSERT dbo.DeploymentResponsibilities (DeploymentId, TeamMemberId, Responsibility, Description) VALUES (@MeridianSummitDeploymentId, @TariqId, N'Implementation Lead', N'Coordinates the synthetic pilot rollout.');

/* A single pending approval and unread reviewer notification make the Phase 2
   workflow demonstrable without requiring live provider configuration. */
DECLARE @DemoRequesterId int = (SELECT Id FROM dbo.Users WHERE Username = N'demo.implementation');
DECLARE @DemoReviewerId int = (SELECT Id FROM dbo.Users WHERE Username = N'demo.manager');
DECLARE @ApprovalId int;
IF NOT EXISTS (SELECT 1 FROM dbo.ApprovalRequests WHERE EntityType = N'Deployment' AND EntityId = @AtlasCedarDeploymentId)
BEGIN
    INSERT dbo.ApprovalRequests (EntityType, EntityId, Title, Description, RequestedByUserId, Status)
    VALUES (N'Deployment', @AtlasCedarDeploymentId, N'Atlas Payments Platform production deployment', N'Review the primary synthetic production deployment before the demonstration release window.', @DemoRequesterId, N'Pending');
END;
SET @ApprovalId = (SELECT TOP 1 Id FROM dbo.ApprovalRequests WHERE EntityType = N'Deployment' AND EntityId = @AtlasCedarDeploymentId ORDER BY Id DESC);
IF NOT EXISTS (SELECT 1 FROM dbo.Notifications WHERE UserId = @DemoReviewerId AND Type = N'ApprovalRequested' AND RelatedEntityType = N'Approval' AND RelatedEntityId = @ApprovalId)
    INSERT dbo.Notifications (UserId, Type, Title, Message, Link, IsRead, Category, RelatedEntityType, RelatedEntityId)
    VALUES (@DemoReviewerId, N'ApprovalRequested', N'Deployment approval requested', N'Atlas Payments Platform production deployment is ready for review.', N'/approvals?focus=' + CONVERT(nvarchar(20), @ApprovalId), 0, N'Approvals', N'Approval', @ApprovalId);

COMMIT TRANSACTION;
