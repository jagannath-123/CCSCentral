import React from "react"
import {AddFeedback, ShowFeedbacks} from "./feedback"
export default function footer() {
	return (
		<div className="text-center border border-dark bg bg-light p-3 m-5">
			<AddFeedback />
			<p>
				This webiste is createde to automate the Configuration Process.
			</p>
			{ShowFeedbacks()}
		</div>
	)
}
