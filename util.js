/**
 * Our main namespace
 */
var ext	=	{load_reason: null};

/**
 * Compare two version strings. If v1 > v2, return 1, if v2 > v1 return -1,
 * if they are the same return 0
 */
function compare_versions(v1, v2)
{
	var v1s	=	v1.split(/\./);
	var v2s	=	v2.split(/\./);

	for(var i = 0, n1 = v1s.length, n2 = v2s.length; i < n1 || i < n2; i++)
	{
		var p1	=	v1s.length > i ? parseInt(v1s[i]) : -1;
		var p2	=	v2s.length > i ? parseInt(v2s[i]) : -1;

		if(p1 > p2) return 1;
		if(p2 > p1) return -1;
	}
	return 0;
}

