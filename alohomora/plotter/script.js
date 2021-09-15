$(".izzy.plotter").on("click", ".index button", function() {
	$(".izzy.plotter .index button").removeClass("active");
	$(".izzy.plotter .content article").removeClass("active");
	const target = $(this).attr("data-for");
	$(this).addClass("active");
	$(`.izzy.plotter .content article[data-label="${target}"]`).addClass("active");
})