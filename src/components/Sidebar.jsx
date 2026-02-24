function Sidebar({ title, items, activeItem, onChange }) {
	return (
		<aside className="side-nav">
			<h3>{title}</h3>
			<div className="side-nav-list">
				{items.map((item) => (
					<button
						key={item.key}
						type="button"
						className={item.key === activeItem ? "nav-item active" : "nav-item"}
						onClick={() => onChange(item.key)}
					>
						<span>{item.label}</span>
						{typeof item.count === "number" ? <small>{item.count}</small> : null}
					</button>
				))}
			</div>
		</aside>
	);
}

export default Sidebar;
