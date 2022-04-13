import React from "react"
import { useState, useEffect } from "react"
import { getDate, findConfig, updateConfigs } from "../services/ccsServices"
import { useParams } from "react-router"
import SessionData from "../Components/SessionData"
import {
	FormField,
	Input,
	SpaceBetween,
	Button,
	Form,
	Header,
	Container,
} from "@amzn/awsui-components-react"

export default function Main() {
	const { id } = useParams()
	const [approver, setApprover] = useState("natarajan")
	const [remarks, setRemarks] = useState("")
	const [creator, setCreator] = useState("")
	const [msg, setMsg] = useState("added")
	useEffect(() => {
		setCreator(creator => SessionData.getUser())
	}, [])

	const [state, setstate] = useState({
		BrandCode: "",
	})
	useEffect(() => {
		if (id) {
			findConfig(id).then(raw => {
				setstate(() => JSON.parse(raw.data.requestDetails))
				console.log("data", raw.data)
				setApprover(() => raw.data.approver)
				setCreator(() => raw.data.creator)
			})
			setMsg("updated")
		}
	}, [id])

	const [showAlert, setShowAlert] = useState(false)

	const submitDetails = status => {
		console.log("id:", id)
		console.log(state)
		const result = updateConfigs(id, {
			requestId: "BC-<count>",
			type: " Brand Code Update Request",
			requestDetails: JSON.stringify(state),
			status: status,
			creator: creator,
			approver: approver,
			remarks: remarks,
			date: getDate(),
			url: "/bc",
		})
		result.then(raw => {
			if (raw.data.message === "true") {
				setShowAlert(true)
			}
			console.log(raw.data)
		})
	}

	return (
		<div>
			{showAlert && (
				<div
					className="alert alert-success alert-dismissible fade show"
					role="alert"
				>
					<strong>Congratulations</strong> .... You have {msg}{" "}
					successfully
					<button
						type="button"
						className="btn-close"
						data-bs-dismiss="alert"
						aria-label="Close"
						onClick={() => setShowAlert(() => false)}
					></button>
				</div>
			)}
			{!SessionData.isApprover() && (
				<form onSubmit={e => e.preventDefault()}>
					<Form
						actions={
							<SpaceBetween direction="horizontal" size="xs">
								<Button
									variant="primary"
									onClick={() => submitDetails("pending")}
								>
									Submit
								</Button>
							</SpaceBetween>
						}
					>
						<Container
							header={
								<Header variant="h2">
									{" "}
									Brand Code Update Request
								</Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
								<FormField
									stretch
									className="mb-3"
									label="BrandCode"
								>
									<Input
										value={state.BrandCode}
										onChange={e => {
											setstate({
												...state,
												BrandCode: e.detail.value,
											})
										}}
									/>
								</FormField>
							</SpaceBetween>
						</Container>
					</Form>
				</form>
			)}

			{SessionData.isApprover() && (
				<form onSubmit={e => e.preventDefault()}>
					<Form
						actions={
							<SpaceBetween direction="horizontal" size="xs">
								<Button
									variant="primary"
									onClick={() => submitDetails("Approved")}
								>
									Approve
								</Button>
								<Button
									formAction="none"
									variant="danger"
									onClick={() => submitDetails("Rejected")}
								>
									Reject
								</Button>
							</SpaceBetween>
						}
					>
						<Container
							header={
								<Header variant="h2">
									{" "}
									Brand Code Update Request
								</Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
								<FormField
									stretch
									className="mb-3"
									label="BrandCode"
								>
									<Input
										value={state.BrandCode}
										readOnly
										disabled
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="Remarks"
								>
									<Input
										onChange={e => {
											setRemarks(e.detail.value)
										}}
										value={remarks}
									/>
								</FormField>
							</SpaceBetween>
						</Container>
					</Form>
				</form>
			)}
		</div>
	)
}
