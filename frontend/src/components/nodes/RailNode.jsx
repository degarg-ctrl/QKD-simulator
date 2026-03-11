/**
 * RailNode — a non-interactive React Flow node that renders
 * a horizontal dashed channel line. Because it IS a React Flow node,
 * it perfectly shares the same coordinate space as all other nodes.
 */
export default function RailNode({ data }) {
  return (
    <div className="rail-node">
      <div className="rail-label">{data?.label || 'CHANNEL'}</div>
      <div className="rail-line" />
    </div>
  );
}
