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
				{ label: val, value: val },
			])
		})
	}, [])
	const [selectedMarketplace, setSelectedMarketplace] = useState(
		Marketplaces[0]
	)

	const [state, setstate] = useState({
		ASIN: "",
		ParentAsin: "",
		Marketplace: "",
		attribute: "",
		ProductClass: "",
	})

	// Adding request id and type;
	const [requestId, setRequestId] = useState("VDS-")
	const [type, setType] = useState("")
	const [count, setCount] = useState(0)

	useEffect(() => {
		setType(() => "Variation Dimension Sorting")
		if (id) {
			findConfig(id).then(raw => {
				setstate(() => JSON.parse(raw.data.requestDetails))
				console.log("data", raw.data)
				setApprover(() => raw.data.approver)
				setCreator(() => raw.data.creator)
				if (raw.data.status === "Approved") {
				}
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

	useEffect(() => {
		if (!id) setRequestId(() => "DARS-" + (count + 1))
	}, [count, id])

	const submitDetails = status => {
		console.log("id:", id)
		console.log(state, selectedMarketplace)

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
			url: "/vds",
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
								<Header variant="h2">
									Variation Dimension Sorting
								</Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
								<FormField
									stretch
									className="mb-3"
									label="ASIN"
								>
									<Input
										value={state.ASIN}
										onChange={e => {
											setstate({
												...state,
												ASIN: e.detail.value,
											})
										}}
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="ParentAsin"
								>
									<Input
										value={state.ParentAsin}
										onChange={e => {
											setstate({
												...state,
												ParentAsin: e.detail.value,
											})
										}}
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
								<FormField
									stretch
									className="mb-3"
									label="attribute"
								>
									<Input
										onChange={e => {
											setstate({
												...state,
												attribute: e.detail.value,
											})
										}}
										value={state.attribute}
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="ProductClass"
								>
									<Input
										onChange={e => {
											setstate({
												...state,
												ProductClass: e.detail.value,
											})
										}}
										value={state.ProductClass}
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
									Accept
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
									Variation Dimension Sorting
								</Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
								<FormField
									stretch
									className="mb-3"
									label="ASIN"
								>
									<Input
										value={state.ASIN}
										readOnly
										disabled
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="ParentAsin"
								>
									<Input
										value={state.ParentAsin}
										readOnly
										disabled
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
									label="attribute"
								>
									<Input
										value={state.attribute}
										readOnly
										disabled
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="ProductClass"
								>
									<Input
										value={state.ProductClass}
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
