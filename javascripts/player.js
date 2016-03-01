var player = new Clappr.Player({
	source: jQuery('.field-name-apiario-url-video .field-item').text(), 
	parentId: "#player",
	poster: jQuery('.field-name-apiario-url-thumb .field-item').text(),
	mediacontrol: {seekbar: "#F39D52", buttons: "white"},
	hideVolumeBar: true,
	autoPlay: true
});