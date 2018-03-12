$(function()
{
    var counter = 5;

    var timer = setInterval(function()
	{
        if (counter <= 1)
        {
            window.location.href = "/";
            clearInterval(timer);
        }
        else
        {
        	$('.back span').html(--counter);
        }
    }, 1000);
    
    $('.back').click(function()
    {
        window.history.back();
    });
})
