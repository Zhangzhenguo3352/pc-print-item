$(function()
{
    var counter = 10;

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
    
    $('.back.flex').click(function()
    {
        window.history.go(-2);
    })
    
    $('.back#back').click(function()
    {
        window.location.href = '/';
    })
})