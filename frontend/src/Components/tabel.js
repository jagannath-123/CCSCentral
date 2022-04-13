/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable array-callback-return */

import { CSVLink } from "react-csv"
import jsPDF from "jspdf"
import "jspdf-autotable"

import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { deleteConfig, getConfigs } from "../services/ccsServices"
import SessionData from "./SessionData"

import {
	Form,
	Container,
	SpaceBetween,
	Input,
	FormField,
	TextFilter,
	Pagination,
	Header,
	CollectionPreferences,
	Cards,
	Box,
	Button,
	Icon,
} from "@amzn/awsui-components-react/polaris"

import Table from "@amzn/awsui-components-react/polaris/table"
import { useCollection } from "@amzn/awsui-collection-hooks"

// this will display the counts of each section like pending, my configs, etc....
const CountRows = (result, user, isApprover) => {
	var totalCount = 0
	var pendingCount = 0
	var myconfigCount = 0
	result.data.forEach(val => {
		console.log(val.creator === user && val.status === "pending")
		if (isApprover) myconfigCount++
		else if (val.creator === user && val.status === "pending")
			pendingCount++
		if (val.creator === user) totalCount++
	})
	console.log([totalCount, pendingCount, myconfigCount])
	return [totalCount, pendingCount, myconfigCount]
}

// this will create the main table

export default function ConfigurationTable(type) {
	if (!type) type = "all"

	const [rawData, setrawData] = useState([])
	const [totalCount, setTotalCount] = useState(0)
	const [pendingCount, setPendingCount] = useState(0)
	const [completedCount, setCompletedCount] = useState(
		totalCount - pendingCount
	)
	const [myCount, setMyCount] = useState(0)
	const [selectedRow, setSelectedRow] = useState({})

	// This function will refresh the data present in the table after changes.
	const refreshTable = () => {
		setrawData(() => [])
		getConfigs().then(result => {
			const counts = CountRows(
				result,
				SessionData.getUser(),
				SessionData.isApprover()
			)
			setTotalCount(() => counts[0])
			setPendingCount(() => counts[1])
			setCompletedCount(() => totalCount - pendingCount)
			setMyCount(() => counts[2])
			result.data.forEach(row => {
				if (
					type != "myconfig" &&
					row.creator === SessionData.getUser()
				) {
					row.requestDetails = JSON.parse(row.requestDetails)
					row.option = Option(row)
					row.view = Preview(row)
					setrawData(rawData => [...rawData, row])
				} else if (type === "myconfig" && SessionData.isApprover()) {
					row.requestDetails = JSON.parse(row.requestDetails)
					row.option = Approval(row)
					row.view = Preview(row)
					setrawData(rawData => [...rawData, row])
				}
				if (row.remarks === "") row.remarks = "NA"
			})
		})
	}

	// this fucntion will add Edit and Delete options column
	const Option = row => {
		const handleDelete = async () => {
			await deleteConfig(row._id)
			refreshTable()
		}

		return (
			<div>
				{row.status !== "Approved" && (
					<div className="row">
						<Link className="col-6" to={row.url + "/" + row._id}>
							<Button variant="primary">
								<Icon name="edit" size="normal" />
							</Button>
						</Link>{" "}
						<Button className="col-4" onClick={handleDelete}>
							<Icon name="close" size="normal" variant="error" />
						</Button>
					</div>
				)}
				{row.status === "Approved" && (
					<strong>No More changes to be done</strong>
				)}
			</div>
		)
	}

	// this function will add an option to open and approve the Configuration
	const Approval = row => {
		return (
			<div className="row">
				<Link to={row.url + "/" + row._id}>
					<Button variant="primary">Approve</Button>
				</Link>
			</div>
		)
	}

	useEffect(() => {
		refreshTable()
	}, [type, SessionData])

	const [data, setdata] = useState([])

	// this will modify data when we cnage condition like pending, completed, my configs
	useEffect(() => {
		setdata(() => [])
		if (type == "Completed") {
			rawData.forEach(val => {
				if (val.status !== "pending") {
					console.log(val)
					setdata(data => [...data, val])
				}
			})
		} else if (type == "pending") {
			rawData.map(val => {
				if (val.status == "pending") {
					setdata(data => [...data, val])
				}
			})
		} else {
			setdata(() => rawData)
		}
	}, [rawData, type])

	//  this is to show the preview in expansion
	const DisplayElement = (key, value) => {
		return (
			<FormField key={key + value} stretch className="mb-3" label={key}>
				<Input readOnly value={value} />
			</FormField>
		)
	}

	const PreviewDetails = details => {
		const [displayData, setDisplayData] = useState([])
		const isEmpty = Object.keys(details).length === 0
		console.log("details", details)
		useEffect(() => {
			if (!isEmpty) {
				setDisplayData(() => [])
				for (var i in details.requestDetails) {
					const key = i,
						value = details.requestDetails[i]
					console.log("key-value", key, value)
					setDisplayData(displayData => [
						...displayData,
						DisplayElement(key, value),
					])
				}
				setDisplayData(displayData => [
					...displayData,
					DisplayElement("remarks", details.remarks),
				])
			}
		}, [details])

		return (
			<div className="m-3 p-2">
				{!isEmpty && (
					<form onSubmit={e => e.preventDefault()}>
						<Form>
							<Container
								header={
									<Header variant="h2">
										{details.type + " - "}
										<strong className="bg bg-secondary rounded bg-opacity-75 text text-light fs-6 p-1 border border-secondary">
											{details.requestId}
										</strong>{" "}
										<br /> <br />
										<p className="text-sm">
											Requestor -{" "}
											<a
												href={
													"https://phonetool.amazon.com/users/" +
													details.creator
												}
												target="_blank"
												rel="noreferrer"
											>
												<strong>
													{details.creator}
												</strong>
											</a>
										</p>
									</Header>
								}
							>
								<SpaceBetween direction="vertical" size="l">
									{displayData}
								</SpaceBetween>
							</Container>
						</Form>
					</form>
				)}
			</div>
		)
	}
	const Preview = row => {
		// console.log(selectedRow);
		return (
			<Button
				className="border border-dark rounded"
				onClick={() => {
					setSelectedRow(() => {
						return {}
					})
					setSelectedRow(() => {
						return row
					})
				}}
			>
				<Icon
					svg={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
						>
							<path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z" />
						</svg>
					}
				/>
			</Button>
		)
	}

	// Exporting as PDF
	const exportPDF = () => {
		const unit = "pt"
		const size = "A4" // Use A1, A2, A3 or A4
		const orientation = "portrait" // portrait or landscape

		const marginLeft = 40
		const doc = new jsPDF(orientation, unit, size)

		doc.setFontSize(15)

		const title = "Configurations"
		const headers = [
			["Request Id", "Type", "Status", "Approver", "Date", "Remarks"],
		]

		const rows = data.map(row => [
			row.requestId,
			row.type,
			row.status,
			row.approver,
			row.date,
			row.remarks,
		])

		let content = {
			startY: 50,
			head: headers,
			body: rows,
		}

		doc.text(title, marginLeft, 40)
		doc.autoTable(content)
		doc.save("report.pdf")
	}

	// Table
	const [preferences, setPreferences] = useState({
		pageSize: 10,
		visibleContent: [
			"requestId",
			"type",
			"status",
			"approver",
			"date",
			"remarks",
			"options",
			"preview",
		],
	})

	const COLUMN_DEFINITIONS = [
		{
			id: "requestId",
			sortingField: "requestId",
			header: "Request Id",
			cell: row => row.requestId,
			width: 50,
		},
		{
			id: "type",
			sortingField: "type",
			header: "Type",
			cell: row => row.type,
			width: 100,
		},
		{
			id: "status",
			sortingField: "status",
			header: "Status",
			cell: row => row.status,
			width: 50,
		},
		{
			id: "approver",
			sortingField: "approver",
			header: "Approver",
			cell: row => row.approver,
			width: 50,
		},
		{
			id: "date",
			sortingField: "date",
			header: "Date",
			cell: Item => Item.date,
			width: 50,
		},
		{
			id: "remarks",
			sortingField: "remarks",
			header: "Remarks",
			cell: row => row.remarks,
			width: 150,
		},
		{
			id: "options",
			header: "Options",
			cell: row => row.option,
			width: 150,
		},

		{
			id: "preview",
			header: "Preview",
			cell: row => row.view,
			width: 150,
		},
	]

	const EmptyTableMessage = message => {
		return <Box>{message}</Box>
	}
	const {
		items,
		filteredItemsCount,
		collectionProps,
		filterProps,
		paginationProps,
	} = useCollection(data, {
		filtering: {
			empty: EmptyTableMessage("No recordsss found.."),
			noMatch: EmptyTableMessage("No results matches the search.."),
		},
		pagination: { pageSize: preferences.pageSize },
		sorting: {},
		selection: {},
	})

	const MyCollectionPreferences = ({ prefernces, setPreferences }) => {
		return (
			<CollectionPreferences
				title="Preferences"
				confirmLabel="Confirm"
				cancelLabel="cancel"
				preferences={prefernces}
				onConfirm={({ detail }) => setPreferences(detail)}
				pageSizePreference={{
					title: "Requests per page",
					options: [
						{ value: 10, label: "10 per page" },
						{ value: 30, label: "30 per page" },
						{ value: 40, label: "50 per page" },
					],
				}}
				wrapLinesPreference={{
					label: "Wrap lines in table",
					description: "Wrap lines for columns having long text",
				}}
				visibleContentPreference={{
					title: "Select preferred columns that should be visible in the table",
					options: [
						{
							label: "Request Details",
							options: [
								{ id: "requestId", label: "Request Number" },
								{ id: "type", label: "Request Type" },
								{
									id: "status",
									label: "Status of the request",
								},
								{ id: "approver", label: "approver names" },
								{ id: "date", label: "date of update" },
								{
									id: "remarks",
									label: "remarks given by resolver",
								},
								{
									id: "options",
									label: "operations on congfiguration",
								},
								{
									id: "preview",
									label: "preview the configuration",
								},
							],
						},
					],
				}}
			/>
		)
	}
	return (
		<>
			<div>
				<br />

				<Cards
					ariaLabels={{
						itemSelectionLabel: (e, t) => `select ${t.name}`,
						selectionGroupLabel: "Item selection",
					}}
					cardDefinition={{
						header: item => (
							<Link
								to={item.link}
								className={"fw-bold text-dark"}
								fontSize="heading-m"
							>
								{item.name}
							</Link>
						),
						sections: [
							{
								id: "description",
								header: "",
								content: item => item.description,
							},
						],
					}}
					cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 4 }]}
					items={[
						{
							name: "Total",
							alt: "First",
							description: "Count: " + totalCount,
							link: "/",
							color: "primary",
						},
						{
							name: "Pending",
							alt: "Second",
							description: "Count: " + pendingCount,
							link: "/home/pending",
							color: "danger",
						},
						{
							name: "Completed",
							alt: "Third",
							description: "Count: " + completedCount,
							link: "/home/Completed",
							color: "success",
						},
						{
							name: "My Configs",
							alt: "Fourth",
							description: "Count: " + myCount,
							link: "/home/myconfig",
							color: "warning",
						},
					]}
					loadingText="Loading resources"
					empty={
						<Box textAlign="center" color="inherit">
							<b>No resources</b>
							<Box
								padding={{ bottom: "s" }}
								variant="p"
								color="inherit"
							>
								No resources to display.
							</Box>
							<Button>Create resource</Button>
						</Box>
					}
					className="m-3"
				/>
			</div>
			{/* Exporting files */}
			<div class="dropdown">
				<button
					class="btn btn-light border border-dark rounded dropdown-toggle m-1"
					type="button"
					id="dropdownMenuButton1"
					data-bs-toggle="dropdown"
					aria-expanded="false"
				>
					Download
				</button>
				<ul
					className="dropdown-menu"
					aria-labelledby="dropdownMenuButton1"
				>
					<li className="m-1 d-flex justify-content-center">
						<button
							className="dropdown-item"
							onClick={() => exportPDF()}
						>
							PDF
						</button>
					</li>
					<li className="m-1 d-flex justify-content-center">
						<CSVLink
							data={data}
							filename={"My-Configurations" + type + ".csv"}
							className="dropdown-item"
							href=""
							target="_blank"
							headers={[
								{
									label: "Request Id",
									key: "requestId",
									width: 50,
								},
								{
									label: "Type",
									key: "type",
									width: 100,
								},
								{
									label: "Status",
									key: "status",
									width: 50,
								},
								{
									label: "Approver",
									key: "approver",
									width: 50,
								},
								{
									label: "Date",
									key: "date",
									width: 50,
									sortingField: "date",
								},
								{
									label: "Remarks",
									key: "remarks",
									width: 150,
								},
							]}
						>
							CSV
						</CSVLink>
					</li>
				</ul>
			</div>
			<Table
				{...collectionProps}
				header={
					<Header
						counter={
							collectionProps.selectedItems.length
								? `(${collectionProps.selectedItems.length}/${data.length})`
								: `(${data.length})`
						}
						variant="h2"
					>
						Configurations{" "}
					</Header>
				}
				className="actual-table"
				columnDefinitions={COLUMN_DEFINITIONS}
				visibleColumns={preferences.visibleContent}
				items={items}
				filter={
					<TextFilter
						{...filterProps}
						filteringPlaceholder="Find in table.."
						countText={filteredItemsCount}
					/>
				}
				pagination={<Pagination {...paginationProps} />}
				preferences={
					<MyCollectionPreferences
						preferences={preferences}
						setPreferences={setPreferences}
					/>
				}
				empty={EmptyTableMessage("No records Found...")}
			/>
			{/* Preview of row */}
			<div className="bg bg-light text-dark m-3 p-3">
				<hr />
				{PreviewDetails(selectedRow)}
			</div>
		</>
	)
}
