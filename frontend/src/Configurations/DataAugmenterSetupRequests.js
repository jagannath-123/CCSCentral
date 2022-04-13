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

export default function DataAugmenterSetupRequests(cookies) {
	const { id } = useParams()
	const [approver, setApprover] = useState("")
	const [remarks, setRemarks] = useState("")
	const [creator, setCreator] = useState(cookies["username"])
	const [msg, setMsg] = useState("added")
	const Marketplaces = cookies["palces"]
	// console.log(cookies)

	const [selectedMarketplace, setSelectedMarketplace] = useState({})

	const [state, setstate] = useState({
		merchant: "",
		ldpa: "",
		Marketplace: "",
	})

	// Adding request id and type;
	const [requestId, setRequestId] = useState("DARS-")
	const [type, setType] = useState("")
	const [count, setCount] = useState(0)

	useEffect(() => {
		setType(() => "Data Argument Setup Requests")
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

	const [showAlert, setShowAlert] = useState(false)
	const [showWarning, setShowWarning] = useState("")
	// console.log(state);

	useEffect(() => {
		if (!id) setRequestId(() => "DARS-" + (count + 1))
	}, [count, id])

	const submitDetails = status => {
		// TODO: update
		if (status === "Rejected" && remarks === "") {
			console.log(status)
			setShowWarning(() => "Need remarks for rejection")
			return
		}

		// TODO: Update
		if (status === "Pending" && SessionData.isApprover()) {
			console.log(status)
			alert("You cannot raise a Configuration")
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

		const result = updateConfigs(id, {
			requestId: requestId,
			type: type,
			requestDetails: JSON.stringify(state),
			status: status,
			creator: creator,
			approver: approver,
			remarks: remarks,
			date: getDate(),
			url: "/dasr",
		})
		result.then(raw => {
			if (raw.data.message === "true") {
				setShowAlert(true)
			}
			console.log(raw.data)
		})
	}

	return (
		<>
			{SessionData.isApprover()
				? true
				: false &&
				  !id && (
						<div>
							<p>
								You are <strong>not allowed</strong> to create a
								Configuration as, you are an{" "}
								<strong>Resolver</strong>.
							</p>
						</div>
				  )}
			{!SessionData.isApprover() && (
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
					{!SessionData.isApprover() && (
						<form onSubmit={e => e.preventDefault()}>
							<Form
								actions={
									<SpaceBetween
										direction="horizontal"
										size="xs"
									>
										<Button
											variant="primary"
											onClick={() =>
												submitDetails("pending")
											}
										>
											Submit
										</Button>
									</SpaceBetween>
								}
							>
								<Container
									header={
										<Header variant="h2">
											Data Augment Setup Requests{" "}
										</Header>
									}
								>
									<SpaceBetween direction="vertical" size="l">
										<FormField
											stretch
											className="mb-3"
											label="merchant"
											errorText={
												state.merchant === ""
													? "Mandatory"
													: ""
											}
										>
											<Input
												onChange={e => {
													setstate({
														...useState,
														merchant:
															e.detail.value,
													})
												}}
												value={state.merchant}
											/>
										</FormField>

										<FormField
											stretch
											className="mb-3"
											label="ldpa"
											errorText={
												state.ldpa === ""
													? "Mandatory"
													: ""
											}
										>
											<Input
												onChange={e => {
													setstate({
														...state,
														ldpa: e.detail.value,
													})
												}}
												value={state.ldpa}
											/>
										</FormField>
										<FormField
											stretch
											className="mb-3"
											label="Marketplace"
											errorText={
												selectedMarketplace
													? "Mandatory"
													: ""
											}
										>
											<Select
												options={[...Marketplaces]}
												selectedOption={
													selectedMarketplace
												}
												onChange={e => {
													setSelectedMarketplace(
														() =>
															e.detail
																.selectedOption
													)
												}}
												selectedAriaLabel="Selected"
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
									<SpaceBetween
										direction="horizontal"
										size="xs"
									>
										<Button
											variant="primary"
											onClick={() =>
												submitDetails("Approved")
											}
										>
											Approve
										</Button>
										<Button
											formAction="none"
											variant="danger"
											onClick={() =>
												submitDetails("Rejected")
											}
										>
											Reject
										</Button>
									</SpaceBetween>
								}
							>
								<Container
									header={
										<Header variant="h2">
											Data Augment Setup Requests -{" "}
											<strong className="bg bg-secondary rounded bg-opacity-75 text text-light p-2 border border-secondary rounded">
												{requestId}
											</strong>{" "}
											<br /> <br />
											<p className="text-sm">
												Requestor -{" "}
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
											label="merchant"
										>
											<Input
												readOnly
												disabled
												value={state.merchant}
											/>
										</FormField>

										<FormField
											stretch
											className="mb-3"
											label="ldpa"
										>
											<Input
												readOnly
												disabled
												value={state.ldpa}
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
			)}
		</>
	)
}
