import { useMemo, useState } from "react";

const initialForm = {
	id: null,
	name: "",
	email: "",
	role: "citizen",
	password: "",
};

function ManageUser({ users, onCreate, onUpdate, onDelete, currentUserId }) {
	const [form, setForm] = useState(initialForm);
	const [message, setMessage] = useState("");

	const isEditing = useMemo(() => Boolean(form.id), [form.id]);

	const resetForm = () => {
		setForm(initialForm);
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		if (isEditing) {
			const result = onUpdate(form.id, {
				name: form.name,
				email: form.email,
				role: form.role,
				password: form.password,
			});

			setMessage(result.message);
			if (result.success) {
				resetForm();
			}
			return;
		}

		const result = onCreate(form);
		setMessage(result.message);
		if (result.success) {
			resetForm();
		}
	};

	const startEdit = (user) => {
		setForm({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			password: "",
		});
		setMessage("");
	};

	const handleDelete = (userId) => {
		const result = onDelete(userId);
		setMessage(result.message);
	};

	return (
		<section className="panel">
			<h3>Manage users</h3>
			<p>Create, update, and remove users across all election roles.</p>

			<form className="compact-form" onSubmit={handleSubmit}>
				<input
					placeholder="Full name"
					required
					value={form.name}
					onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
				/>
				<input
					placeholder="Email"
					type="email"
					required
					value={form.email}
					onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
				/>
				<select
					value={form.role}
					onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
				>
					<option value="admin">Admin</option>
					<option value="citizen">Citizen</option>
					<option value="observer">Observer</option>
					<option value="analyst">Analyst</option>
				</select>
				<input
					placeholder={isEditing ? "New password (optional)" : "Password"}
					type="password"
					minLength={isEditing ? 0 : 6}
					required={!isEditing}
					value={form.password}
					onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
				/>
				<div className="form-row">
					<button className="btn btn-primary" type="submit">
						{isEditing ? "Update User" : "Create User"}
					</button>
					{isEditing ? (
						<button className="btn btn-outline" type="button" onClick={resetForm}>
							Cancel
						</button>
					) : null}
				</div>
				{message ? <p className="muted">{message}</p> : null}
			</form>

			<div className="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr key={user.id}>
								<td>{user.name}</td>
								<td>{user.email}</td>
								<td>
									<span className="pill">{user.role}</span>
								</td>
								<td>
									<div className="table-actions">
										<button className="btn btn-outline" type="button" onClick={() => startEdit(user)}>
											Edit
										</button>
										<button
											className="btn btn-danger"
											type="button"
											disabled={user.id === currentUserId}
											onClick={() => handleDelete(user.id)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

export default ManageUser;
