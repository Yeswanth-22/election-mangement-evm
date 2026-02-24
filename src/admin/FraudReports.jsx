import { useState } from "react";

function FraudReports({ reports, onUpdate, onDelete }) {
	const [message, setMessage] = useState("");

	const handleStatusChange = (reportId, status) => {
		const result = onUpdate(reportId, { status });
		setMessage(result.message);
	};

	const handleDelete = (reportId) => {
		const result = onDelete(reportId);
		setMessage(result.message);
	};

	return (
		<section className="panel">
			<h3>Fraud report desk</h3>
			<p>Review citizen reports, update workflow status, and remove invalid entries.</p>
			{message ? <p className="muted">{message}</p> : null}

			<div className="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Title</th>
							<th>Location</th>
							<th>Category</th>
							<th>Status</th>
							<th>Reporter</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{reports.map((report) => (
							<tr key={report.id}>
								<td>{report.title}</td>
								<td>{report.location}</td>
								<td>{report.category}</td>
								<td>
									<select
										value={report.status}
										onChange={(event) =>
											handleStatusChange(report.id, event.target.value)
										}
									>
										<option value="submitted">Submitted</option>
										<option value="under-review">Under Review</option>
										<option value="verified">Verified</option>
										<option value="rejected">Rejected</option>
									</select>
								</td>
								<td>{report.createdBy}</td>
								<td>
									<button
										className="btn btn-danger"
										type="button"
										onClick={() => handleDelete(report.id)}
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

export default FraudReports;
