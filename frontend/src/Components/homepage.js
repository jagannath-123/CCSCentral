import React from "react"
import ActualTable from "./tabel"
import footer from "./footer"
import { useParams } from "react-router-dom"

export default function HomePage() {
	let { status } = useParams()

	if (!status) status = ""

	return (
		<div className="m-3 bg bg-light">
			<h1 className="m-3">Dashboard</h1>
			{ActualTable(status)}
			<br />
			<br />
			{footer()}
		</div>
	)
}
