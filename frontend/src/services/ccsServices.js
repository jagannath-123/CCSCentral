import axios from "axios"

const baseUrl = "http://10.253.92.169:8020/"

export function getConfigs() {
	return axios.get(baseUrl)
}

export function getUser() {
	return axios.get(baseUrl + "getusr")
}

export function isApprover(username) {
	return axios.post(baseUrl + "isresolver", {
		login: username,
		group: "CatalogConfigSupport",
	})
}

export function updateConfigs(id, data) {
	console.log("services-ccsServices-updateConfig: ", id, data)
	if (id) {
		return axios.put(baseUrl + id, data)
	} else {
		return axios.post(baseUrl, data)
	}
}

export function findConfigs(id) {
	return axios.get(baseUrl + id)
}

export function deleteConfig(id) {
	console.log("service-delete:", id)
	return axios.delete(baseUrl + id)
}

export function findConfig(id) {
	return axios.get(baseUrl + id)
}

export function getDate() {
	var today = new Date()
	var dd = String(today.getDate()).padStart(2, "0")
	var mm = String(today.getMonth() + 1).padStart(2, "0") //January is 0!
	var yyyy = today.getFullYear()

	today = mm + "/" + dd + "/" + yyyy
	return today
}

// Feedback  API calls
export function getFeedback() {
	return axios.get(baseUrl + 'feedback');
}

export function addFeedback(data) {
	return axios.post(baseUrl + 'feedback', data);
}
