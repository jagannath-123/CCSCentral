import React from "react"
import {AddFeedback} from "./feedback"
export default function AboutUs() {
	return (
		<div className="container ">
			<h1>About Us</h1>
			<p>
				This is a web page developed by the CCS team of amaon to manage
				the configurations in the SIms and issuese raised in catalouge
				of amazon.
				<br />
				<br />
				If there are any issues mail to{" "}
				<a
					href="https://phonetool.amazon.com/users/jagamanc"
					target="_blank"
					rel="noreferrer"
				>
					jagamanc@amazon.com
				</a>
			</p>
			<AddFeedback />
		</div>
	)
}
