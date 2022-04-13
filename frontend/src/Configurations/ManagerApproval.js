import React from "react"
import { useState, useEffect } from "react"
import {
	getDate,
	findConfig,
	updateConfigs,
	getConfigs,
} from "../services/ccsServices"
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
	Select,
} from "@amzn/awsui-components-react"

export default function Main() {
	const { id } = useParams()
	const [approver, setApprover] = useState("")
	const [remarks, setRemarks] = useState("")
	const [creator, setCreator] = useState("")
	const [msg, setMsg] = useState("added")
	const [Marketplaces, setMarketplaces] = useState([])
	useEffect(() => {
		setCreator(creator => SessionData.getUser())
		SessionData.getMarketPlace().forEach(val => {
			setMarketplaces(Marketplaces => [
				...Marketplaces,
				{ label: val[0], value: val[0] },
			])
		})
	}, [])

	const [selectedMarketplace, setSelectedMarketplace] = useState(
		Marketplaces[0]
	)

	const [state, setstate] = useState({
		Issue: "",
		Marketplace: "",
		selectedFile: "",
	})

	// Adding request id and type;
	const [requestId, setRequestId] = useState("MA-")
	const [type, setType] = useState("")
	const [count, setCount] = useState(0)

	useEffect(() => {
		setType(() => "Manager Approval")
		if (id) {
			findConfig(id).then(raw => {
				setstate(JSON.parse(raw.data.requestDetails))
				console.log("data", raw.data)
				setCreator(raw.data.creator)
				setRequestId(raw.data.requestId)
				setRemarks(raw.data.remarks)
			})
			setMsg("updated")
		} else {
			getConfigs().then(raw => {
				raw.data.forEach(val => {
					console.log(val.type.trim())
					if (val.type.trim() === type) setCount(count => count + 1)
				})
			})
		}
	}, [id, type])
	// debugging
	console.log("approver", approver)
	console.log("creator", creator)
	console.log(
		"current user:",
		SessionData.getUser(),
		SessionData.getUser() === approver
	)

	const [showAlert, setShowAlert] = useState(false)
	const [showWarning, setShowWarning] = useState("")
	// console.log(state);

	useEffect(() => {
		if (!id) setRequestId(() => "MA-" + (count + 1))
	}, [count, id])

	const submitDetails = status => {
		// TODO: update
		if (status === "Rejected" && remarks === "") {
			console.log(status)
			setShowWarning(() => "Need remarks for rejection")
			return
		}

		console.log(
			"id:",
			id,
			SessionData.getUser(),
			SessionData.isApprover(),
			SessionData.isApprover() ? approver : ""
		)
		console.log(state)
		if (SessionData.isApprover() && status !== "pending") {
			console.log("setting approver")
			setApprover(() => SessionData.getUser())
		}

		if (!id) state.Marketplace = selectedMarketplace.value

		// ---- Form uploading --------
		// Create an object of formData
		const formData = new FormData()

		// Update the formData object
		formData.append(
			"myFile",
			this.state.selectedFile,
			this.state.selectedFile.name
		)

		// Details of the uploaded file
		console.log(this.state.selectedFile)

		// Request made to the backend api
		// Send formData object
		// axios.post("api/uploadfile", formData)

		const result = updateConfigs(id, {
			requestId: requestId,
			type: type,
			requestDetails: JSON.stringify(state),
			status: status,
			creator: creator,
			approver: approver,
			remarks: remarks,
			date: getDate(),
			url: "/ma",
		})
		result.then(raw => {
			if (raw.data.message === "true") {
				setShowAlert(true)
			}
			console.log(raw.data)
		})
	}

	// File content to be displayed after
	// file upload is complete
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
						// TODO: Update
						onClick={() => {
							setShowAlert(() => false)
						}}
					></button>
				</div>
			)}

			{/* TODO: adding error text gor every form feild */}
			{/* TODO: To remove special case of "jaggu" */}
			{(!SessionData.isApprover() ||
				SessionData.getUser() === "jaggu") && (
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
								<Header variant="h2">Manager Approval </Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
								<FormField
									stretch
									className="mb-3"
									label="Issue"
									description="descirbe in detail about the issue"
									errorText={
										state.Issue === ""
											? "it is required"
											: ""
									}
								>
									<Input
										onChange={e => {
											setstate({
												...useState,
												Issue: e.detail.value,
											})
										}}
										value={state.Issue}
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="Marketplace"
								>
									<Select
										options={[...Marketplaces]}
										selectedOption={selectedMarketplace}
										onChange={e => {
											setSelectedMarketplace(
												() => e.detail.selectedOption
											)
										}}
										selectedAriaLabel="Selected"
									/>
								</FormField>
								<FormField label="if there are any files or screenshots , uploade them">
									<input
										type="file"
										onChange={e =>
											setstate({
												...state,
												selectedFile: e.target.files[0],
											})
										}
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
									Manager Approval -{" "}
									<strong className="bg bg-secondary rounded bg-opacity-75 text text-light p-2 border border-secondary rounded">
										{requestId}
									</strong>{" "}
									<br /> <br />
									<p className="text-sm">
										Creator -{" "}
										<a
											href={
												"https://phonetool.amazon.com/users/" +
												creator
											}
											target="_blank"
											rel="noreferrer"
										>
											<strong className="bg bg-secondary border border-secondary text-light p-1 rounded">
												{creator}
											</strong>
										</a>
									</p>
								</Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
								<FormField
									stretch
									className="mb-3"
									label="Issue"
								>
									<Input
										readOnly
										disabled
										value={state.Issue}
									/>
								</FormField>

								<FormField
									stretch
									className="mb-3"
									label="Marketplace"
								>
									<Input
										value={state.Marketplace}
										readOnly
										disabled
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="Remarks"
									// TODO: update
									description="Add remarks if you want to tell the requestor"
									errorText={showWarning}
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
					></button>
				</div>
			)}
		</div>
	)
}
