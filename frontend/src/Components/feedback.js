import React from "react"
import {
	Modal,
	FormField,
	Input,
	Button,
	RadioGroup,
	Box,
	Table,
	TextFilter,
	Header
} from "@amzn/awsui-components-react/polaris"
import { addFeedback, getFeedback } from "../services/ccsServices"
import { getDate } from "../services/ccsServices"
import SessionData from "./SessionData"

export function AddFeedback() {
	const [visible, setVisible] = React.useState(false)
	const [remarks, setremarks] = React.useState("")
	const [rating, setRating] = React.useState({})
	const submitFeedback = () => {
		console.log(remarks, rating)
		setVisible(() => false)
		const result = addFeedback({
			user: SessionData.getUser(),
			rating: rating,
			remarks: remarks,
			date: getDate(),
		})
		result.then(raw => {
			if (raw.data.message === "true") alert("Thanks for your feedback.")
			else alert(raw.data.message)
		})
	}
	return (
		<div>
			<Button
				variant="link"
				onClick={() => {
					setVisible(() => true)
				}}
			>
				Feedback
			</Button>
			<Modal
				onDismiss={() => setVisible(false)}
				visible={visible}
				closeAriaLabel="Close modal"
				id="feedbackModal"
				size="large"
				header="Feedback"
				footer={
					<Box float="right">
						<Button
							variant="primary"
							onClick={() => {
								submitFeedback()
							}}
						>
							Submit
						</Button>
					</Box>
				}
			>
				Please rate your experience or any difficulties which you face,
				which will help us improve.
				<div>
					<FormField>
						<RadioGroup
							items={[
								{
									value: "Good",
									label: "Good",
								},
								{
									value: "Bad",
									label: "Bad",
								},
							]}
							value={rating}
							onChange={e => setRating(e.detail.value)}
						/>
					</FormField>
					<br />
					<FormField label="Remarks:">
						<Input
							value={remarks}
							onChange={event => setremarks(event.detail.value)}
						/>
					</FormField>
				</div>
			</Modal>
		</div>
	)
}

export function ShowFeedbacks() {
	const [feedbacks, setFeedbacks] = React.useState([])
	React.useEffect(() => {
		getFeedback().then(raw => {
			console.log("raw", raw.data)
			if (raw.data.message) {
				alert(raw.data.message)
			} else {
				setFeedbacks(() => [...raw.data])
			}
		})
	}, [])
	return (
		<div>
			{ (
				<>
					<h3>Feedbacks</h3>
				</>
			)}
		</div>
	)
}
