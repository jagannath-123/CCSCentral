var SessionData = (function () {
	var user = ""
	var marketplace = []
	var marketId = []
	var pendingCount = 0
	var totalCount = 0
	var myconfigCount = 0
	var approver = false
	var manager = false

	const marketplaceIdMatching = {
		US: 1,
		UK: 3,
		FR: 5,
		IN: 44571,
		GB: 4,
	}

	const getUser = () => {
		return user
	}

	const getPendingCount = () => {
		return pendingCount
	}

	const getTotalCount = () => {
		return totalCount
	}

	const getMarketPlace = () => {
		return [...marketplace]
	}

	const getMarketId = () => {
		return marketId
	}

	const setUser = params => {
		user = params
	}

	const setMarketPlace = params => {
		// TODO: need to update market id based on market place
		params.forEach(i => {
			marketplace = [...marketplace, [i, marketplaceIdMatching[i]]]
		})
	}

	const setPendingCount = params => {
		pendingCount = params
	}

	const setTotalCount = params => {
		totalCount = params
	}
	const setmyconfigCount = params => {
		myconfigCount = params
	}

	const getmyconfigCount = params => {
		return myconfigCount
	}

	const isApprover = () => {
		return approver
	}

	const setApprover = params => {
		console.log("sessiondata-setapprover:", params === true)
		approver = params === true
	}

	const isManager = () => {
		return manager === true
	}
	const setManager = params => {
		console.log("sessiondata-setManager:", params === "true")
		manager = params
	}

	return {
		getUser: getUser,
		setUser: setUser,

		getMarketId: getMarketId,
		getMarketPlace: getMarketPlace,
		setMarketPlace: setMarketPlace,

		getTotalCount: getTotalCount,
		setTotalCount: setTotalCount,

		getPendingCount: getPendingCount,
		setPendingCount: setPendingCount,

		setmyconfigCount: setmyconfigCount,
		getmyconfigCount: getmyconfigCount,

		isApprover: isApprover,
		setApprover: setApprover,

		isManager: isManager,
		setManager: setManager,
	}
})()

export default SessionData
