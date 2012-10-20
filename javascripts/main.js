var betaCreator = null;

function init() {
	var outp = document.getElementById('outp');
	betaCreator = BetaCreator(document.getElementById('srcImg'), {
		zoom: 'contain',
		height: 400,
		width: '100%'
	});
}

function saveData() {
	if (!betaCreator)
		return;

	if (window.localStorage)
		localStorage.bcData = betaCreator.getData();
	else
		alert(betaCreator.getData());
}

function loadData() {
	if (!betaCreator)
		return;

	if (window.localStorage && localStorage.bcData)
		betaCreator.loadData(localStorage.bcData);
	else
		alert("No data stored locally. You must have a browser that supports local storage and save first.");
}
