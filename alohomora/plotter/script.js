const hash = location.hash.replace("#", "");
const targets = $(".index button").get().map( el => el.dataset.for );

if (targets.includes(hash)) {
	toggleItem(hash);
	const position = $(".izzy.plotter") - 130;
	$('html, body').scrollTop( position )
}

$(".izzy.plotter").on("click", ".index button", function() {
	const target = $(this).attr("data-for");
	toggleItem(target);
})

function toggleItem(target) {
	$(".izzy.plotter .index button").removeClass("active");
	$(".izzy.plotter .content article").removeClass("active");
	$(`.izzy.plotter .index [data-for="${target}"]`).addClass("active");
	$(`.izzy.plotter .content [data-label="${target}"]`).addClass("active");
	location.hash = target;
}