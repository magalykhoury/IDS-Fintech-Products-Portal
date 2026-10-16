import type { Client } from "../types/client";
import type { Deployment } from "../types/deployment";
import type { Product } from "../types/product";

interface PortfolioFlowProps {
  products: Product[];
  deployments: Deployment[];
  clients: Client[];
}

const PRODUCT_X = 28;
const PRODUCT_WIDTH = 218;
const DEPLOYMENT_X = 412;
const DEPLOYMENT_WIDTH = 176;
const CLIENT_X = 754;
const CLIENT_WIDTH = 218;
const NODE_HEIGHT = 52;

function nodeY(index: number, count: number, height: number) {
  if (count <= 1) {
    return height / 2 - NODE_HEIGHT / 2;
  }

  const top = 38;
  const bottom = height - NODE_HEIGHT - 38;
  return top + (index * (bottom - top)) / (count - 1);
}

function shorten(value: string, limit = 27) {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function flowPath(startX: number, startY: number, endX: number, endY: number) {
  const midpoint = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midpoint - 52} ${startY}, ${midpoint + 52} ${endY}, ${endX} ${endY}`;
}

export default function PortfolioFlow({ products, deployments, clients }: PortfolioFlowProps) {
  const rowCount = Math.max(products.length, deployments.length, clients.length, 1);
  const height = Math.max(318, 92 + rowCount * 68);
  const productPositions = new Map(products.map((product, index) => [product.id, nodeY(index, products.length, height)]));
  const clientPositions = new Map(clients.map((client, index) => [client.id, nodeY(index, clients.length, height)]));

  return (
    <div className="portfolio-flow">
      <div className="portfolio-flow-canvas">
        <svg
          className="portfolio-flow-svg"
          viewBox={`0 0 1000 ${height}`}
          role="img"
          aria-label="Product deployments connected to clients"
        >
          <rect className="portfolio-flow-surface" x="0" y="0" width="1000" height={height} rx="8" />

          <g className="portfolio-flow-links" aria-hidden="true">
            {deployments.map((deployment, index) => {
              const productY = productPositions.get(deployment.productId);
              const clientY = clientPositions.get(deployment.clientId);

              if (productY === undefined || clientY === undefined) {
                return null;
              }

              const deploymentY = nodeY(index, deployments.length, height);
              const productCenter = productY + NODE_HEIGHT / 2;
              const clientCenter = clientY + NODE_HEIGHT / 2;
              const deploymentCenter = deploymentY + NODE_HEIGHT / 2;

              return (
                <g className="portfolio-flow-deployment" key={deployment.id} tabIndex={0}>
                  <title>{`${deployment.productName} ${deployment.productVersion} deployed to ${deployment.clientName}`}</title>
                  <path
                    className="portfolio-flow-link"
                    d={flowPath(PRODUCT_X + PRODUCT_WIDTH, productCenter, DEPLOYMENT_X, deploymentCenter)}
                  />
                  <path
                    className="portfolio-flow-link"
                    d={flowPath(DEPLOYMENT_X + DEPLOYMENT_WIDTH, deploymentCenter, CLIENT_X, clientCenter)}
                  />
                  <rect
                    className="portfolio-flow-deployment-node"
                    x={DEPLOYMENT_X}
                    y={deploymentY}
                    width={DEPLOYMENT_WIDTH}
                    height={NODE_HEIGHT}
                    rx="6"
                  />
                  <text className="portfolio-flow-deployment-version" x={DEPLOYMENT_X + 14} y={deploymentY + 21}>
                    {shorten(deployment.productVersion, 21)}
                  </text>
                  <text className="portfolio-flow-deployment-status" x={DEPLOYMENT_X + 14} y={deploymentY + 38}>
                    {shorten(deployment.status, 23)}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="portfolio-flow-products">
            {products.map((product, index) => {
              const y = nodeY(index, products.length, height);

              return (
                <g className="portfolio-flow-node" key={product.id}>
                  <rect className="portfolio-flow-node-surface" x={PRODUCT_X} y={y} width={PRODUCT_WIDTH} height={NODE_HEIGHT} rx="6" />
                  <text className="portfolio-flow-node-label" x={PRODUCT_X + 14} y={y + 20}>Product</text>
                  <text className="portfolio-flow-node-name" x={PRODUCT_X + 14} y={y + 38}>{shorten(product.name)}</text>
                </g>
              );
            })}
          </g>

          <g className="portfolio-flow-clients">
            {clients.map((client, index) => {
              const y = nodeY(index, clients.length, height);

              return (
                <g className="portfolio-flow-node" key={client.id}>
                  <rect className="portfolio-flow-node-surface" x={CLIENT_X} y={y} width={CLIENT_WIDTH} height={NODE_HEIGHT} rx="6" />
                  <text className="portfolio-flow-node-label" x={CLIENT_X + 14} y={y + 20}>Client</text>
                  <text className="portfolio-flow-node-name" x={CLIENT_X + 14} y={y + 38}>{shorten(client.companyName)}</text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="portfolio-flow-mobile" aria-label="Mobile portfolio flow">
          {deployments.length === 0 ? (
            <p className="empty-text">No deployments connect products to clients yet.</p>
          ) : (
            deployments.map((deployment) => (
              <div className="portfolio-flow-mobile-row" key={deployment.id}>
                <div>
                  <span>Product</span>
                  <strong>{deployment.productName}</strong>
                </div>
                <span className="portfolio-flow-mobile-connector" aria-hidden="true">↓</span>
                <div>
                  <span>Deployment · {deployment.productVersion}</span>
                  <strong>{deployment.status}</strong>
                </div>
                <span className="portfolio-flow-mobile-connector" aria-hidden="true">↓</span>
                <div>
                  <span>Client</span>
                  <strong>{deployment.clientName}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="portfolio-flow-legend" aria-label="Portfolio flow legend">
        <span><i className="portfolio-flow-legend-mark product" />Products</span>
        <span><i className="portfolio-flow-legend-mark deployment" />Deployments</span>
        <span><i className="portfolio-flow-legend-mark client" />Clients</span>
      </div>
    </div>
  );
}
