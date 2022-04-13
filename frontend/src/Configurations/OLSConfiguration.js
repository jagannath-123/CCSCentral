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
	Select,
} from "@amzn/awsui-components-react"
import { getConfigs } from "../services/ccsServices"

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
		Marketplace: "",
		Merchant: "",
		LanguageTag: "",
		CurrencyCode: "",
	})

	const [requestId, setRequestId] = useState("OLS-")
	const [count, setCount] = useState(0)

	useEffect(() => {
		if (id) {
			findConfig(id).then(raw => {
				setstate(() => JSON.parse(raw.data.requestDetails))
				console.log("data", raw.data)
				setApprover(() => raw.data.approver)
				setCreator(() => raw.data.creator)
			})
			setMsg("updated")
		} else {
			getConfigs().then(raw => {
				raw.data.forEach(val => {
					console.log(val.type.trim())
					if (val.type.trim() === "OLS Configuration")
						setCount(count => count + 1)
				})
			})
		}
	}, [id])
	const [showAlert, setShowAlert] = useState(false)

	useEffect(() => {
		if (!id) setRequestId(() => "OLS-" + (count + 1))
	}, [count, id])

	const submitDetails = status => {
		console.log("id:", id)
		console.log(state, selectedMarketplace)
		if (!id) {
			state.Marketplace = selectedMarketplace.value
		}
		const result = updateConfigs(id, {
			requestId: requestId,
			type: "OLS Configuration",
			requestDetails: JSON.stringify(state),
			status: status,
			creator: creator,
			approver: approver,
			remarks: remarks,
			date: getDate(),
			url: "/ols",
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
								<Header variant="h2">OLS Configuration</Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
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
									label="Merchant"
								>
									<Input
										value={state.Merchant}
										onChange={e => {
											setstate({
												...state,
												Merchant: e.detail.value,
											})
										}}
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="LanguageTag"
								>
									<Input
										onChange={e => {
											setstate({
												...state,
												LanguageTag: e.detail.value,
											})
										}}
										value={state.LanguageTag}
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="CurrencyCode"
								>
									<Input
										value={state.CurrencyCode}
										onChange={e => {
											setstate({
												...state,
												CurrencyCode: e.detail.value,
											})
										}}
									/>
								</FormField>
							</SpaceBetween>
						</Container>
					</Form>
				</form>
			)}
			{/* TODO:  need to remove natarajan verify. */}
			{(SessionData.isApprover() ||
				SessionData.getUser() === "natarajan") && (
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
								<Header variant="h2">OLS Configuration</Header>
							}
						>
							<SpaceBetween direction="vertical" size="l">
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
									label="Merchant"
								>
									<Input
										value={state.Merchant}
										readOnly
										disabled
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="LanguageTag"
								>
									<Input
										readOnly
										disabled
										value={state.LanguageTag}
									/>
								</FormField>
								<FormField
									stretch
									className="mb-3"
									label="CurrencyCode"
								>
									<Input
										value={state.CurrencyCode}
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
