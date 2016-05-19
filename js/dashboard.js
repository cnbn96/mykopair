//=======
// TALBE
//=======
(function (namespace, $) {
    "use strict";

    var DemoTableDynamic = function () {
        // Create reference to this instance
        var o = this;
        // Initialize app when document is ready
        $(document).ready(function () {
            o.initialize();
        });

    };
    var p = DemoTableDynamic.prototype;

    // =========================================================================
    // INIT
    // =========================================================================

    p.initialize = function () {
        this._initDataTables();
    };

    // DATATABLE
    p._initDataTables = function () {
		if (!$.isFunction($.fn.dataTable)) {
			return;
		}

		// Init the demo DataTables
		this._createDataTable1();
	};
    p._createDataTable1 = function () {
        $('.table-dynamic').DataTable({
			"bProcessing": true,
            "dom": 'lCfrtip',
            "order": [],
            "language": {
                "lengthMenu": '_MENU_ entries per page',
                "search": '<i class="fa fa-search"></i>',
                "paginate": {
                    "previous": '<i class="fa fa-angle-left"></i>',
                    "next": '<i class="fa fa-angle-right"></i>'
                }
            }
        });
        $('.table-dynamic tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
        });
    };

    namespace.DemoTableDynamic = new DemoTableDynamic;

	//=======
	// END TALBE
	//=======


	//=======
	// AppNavigation
	//=======



	var AppNavigation = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function () {
			o.initialize();
		});

	};
	var p = AppNavigation.prototype;

	// =========================================================================
	// MEMBERS
	// =========================================================================

	// Constant
	AppNavigation.MENU_MAXIMIZED = 1;
	AppNavigation.MENU_COLLAPSED = 2;
	AppNavigation.MENU_HIDDEN = 3;

	// Private
	p._lastOpened = null;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function () {
		this._enableEvents();

		this._invalidateMenu();
		this._evalMenuScrollbar();
	};

	// =========================================================================
	// EVENTS
	// =========================================================================

	// events
	p._enableEvents = function () {
		var o = this;

		// Window events
		$(window).on('resize', function (e) {
			o._handleScreenSize(e);
		});

		// Menu events
		$('[data-toggle="menubar"]').on('click', function (e) {
			o._handleMenuToggleClick(e);
		});
		$('[data-dismiss="menubar"]').on('click', function (e) {
			o._handleMenubarLeave();
		});
		$('#main-menu').on('click', 'li', function (e) {
			o._handleMenuItemClick(e);
		});
		$('#main-menu').on('click', 'a', function (e) {
			o._handleMenuLinkClick(e);
		});
		$('body.menubar-hoverable').on('mouseenter', '#menubar', function (e) {
			setTimeout(function () {
				o._handleMenubarEnter();
			}, 1);
		});
	};

	// handlers
	p._handleScreenSize = function (e) {
		this._invalidateMenu();
		this._evalMenuScrollbar(e);
	};

	// =========================================================================
	// MENU TOGGLER
	// =========================================================================

	p._handleMenuToggleClick = function (e) {
		if (!materialadmin.App.isBreakpoint('xs')) {
			$('body').toggleClass('menubar-pin');
		}

		var state = this.getMenuState();

		if (state === AppNavigation.MENU_COLLAPSED) {
			this._handleMenubarEnter();
		}
		else if (state === AppNavigation.MENU_MAXIMIZED) {
			this._handleMenubarLeave();
		}
		else if (state === AppNavigation.MENU_HIDDEN) {
			this._handleMenubarEnter();
		}
	};

	// =========================================================================
	// MAIN BAR
	// =========================================================================

	p._handleMenuItemClick = function (e) {
		e.stopPropagation();

		var item = $(e.currentTarget);
		var submenu = item.find('> ul');
		var parentmenu = item.closest('ul');

		this._handleMenubarEnter(item);

		if (submenu.children().length !== 0) {
			this._closeSubMenu(parentmenu);

			var menuIsCollapsed = this.getMenuState() === AppNavigation.MENU_COLLAPSED;
			if (menuIsCollapsed || item.hasClass('expanded') === false) {
				this._openSubMenu(item);
			}
		}
	};

	p._handleMenubarEnter = function (menuItem) {
		var o = this;
		var offcanvasVisible = $('body').hasClass('offcanvas-left-expanded');
		var menubarExpanded = $('#menubar').data('expanded');
		var menuItemClicked = (menuItem !== undefined);

		// Check if the menu should open
		if ((menuItemClicked === true || offcanvasVisible === false) && menubarExpanded !== true) {
			// Add listener to close the menubar

			$('#content').one('mousedown', function (e) {
				o._handleMenubarLeave();
			});

			// Add open variables
			$('body').addClass('menubar-visible');
			$('#menubar').data('expanded', true);

			// Triger enter event
			$('#menubar').triggerHandler('enter');


			if (menuItemClicked === false) {
				// If there is a previous opened item, open it and all of its parents
				if (this._lastOpened) {
					var o = this;
					this._openSubMenu(this._lastOpened, 0);
					this._lastOpened.parents('.gui-folder').each(function () {
						o._openSubMenu($(this), 0);
					});
				}
				else {
					// Else open the active item
					var item = $('#main-menu > li.active');
					this._openSubMenu(item, 0);
				}
			}
		}
	};

	p._handleMenubarLeave = function () {
		$('body').removeClass('menubar-visible');

		// Don't close the menus when it is pinned on large viewports
		if (materialadmin.App.minBreakpoint('md')) {
			if ($('body').hasClass('menubar-pin')) {
				return;
			}
		}
		$('#menubar').data('expanded', false);


		// Never close the menu on extra small viewports
		if (materialadmin.App.isBreakpoint('xs') === false) {
			this._closeSubMenu($('#main-menu'));
		}
	};


	p._handleMenuLinkClick = function (e) {
		// Prevent the link from firing when the menubar isn't visible
		if (this.getMenuState() !== AppNavigation.MENU_MAXIMIZED) {
			e.preventDefault();
		}
	};

	// =========================================================================
	// OPEN / CLOSE MENU
	// =========================================================================

	p._closeSubMenu = function (menu) {
		var o = this;
		menu.find('> li > ul').stop().slideUp(170, function () {
			$(this).closest('li').removeClass('expanded');
			o._evalMenuScrollbar();
		});
	};

	p._openSubMenu = function (item, duration) {
		var o = this;
		if (typeof (duration) === 'undefined') {
			duration = 170;
		}

		// Remember the last opened item
		this._lastOpened = item;

		// Expand the menu
		item.addClass('expanding');
		item.find('> ul').stop().slideDown(duration, function () {
			item.addClass('expanded');
			item.removeClass('expanding');

			// Check scrollbars
			o._evalMenuScrollbar();

			// Manually remove the style, jQuery sometimes failes to remove it
			$('#main-menu ul').removeAttr('style');
		});
	};

	// =========================================================================
	// UTILS
	// =========================================================================

	p._invalidateMenu = function () {
		// Retrieve active link
		var selectedLink = $('#main-menu a.active');

		// Expand all parent submenu's of the active link so it will be visible on startup
		selectedLink.parentsUntil($('#main-menu')).each(function () {
			if ($(this).is('li')) {
				$(this).addClass('active');
				$(this).addClass('expanded');
			}
		});

		// When invalidating, dont expand the first submenu when the menu is collapsed
		if (this.getMenuState() === AppNavigation.MENU_COLLAPSED) {
			$('#main-menu').find('> li').removeClass('expanded');
		}

		// Check if the menu is visible
		if ($('body').hasClass('menubar-visible')) {
			this._handleMenubarEnter();
		}

		// Trigger event
		$('#main-menu').triggerHandler('ready');

		// Add the animate class for CSS transitions.
		// It solves the slow initiation bug in IE, 
		// wich makes the collapse visible on startup
		$('#menubar').addClass('animate');
	};

	p.getMenuState = function () {
		// By using the CSS properties, we can attach 
		// states to CSS properties and therefor control states in CSS
		var matrix = $('#menubar').css("transform");
		var values = (matrix) ? matrix.match(/-?[\d\.]+/g) : null;

		var menuState = AppNavigation.MENU_MAXIMIZED;
		if (values === null) {
			if ($('#menubar').width() <= 100) {
				menuState = AppNavigation.MENU_COLLAPSED;
			}
			else {
				menuState = AppNavigation.MENU_MAXIMIZED;
			}
		}
		else {
			if (values[4] === '0') {
				menuState = AppNavigation.MENU_MAXIMIZED;
			}
			else {
				menuState = AppNavigation.MENU_HIDDEN;
			}
		}

		return menuState;
	};

	p._evalMenuScrollbar = function () {
		if (!$.isFunction($.fn.nanoScroller)) {
			return;
		}

		// First calculate the footer height
		var footerHeight = $('#menubar .menubar-foot-panel').outerHeight();
		footerHeight = Math.max(footerHeight, 1);
		$('.menubar-scroll-panel').css({ 'padding-bottom': footerHeight });


		// Check if there is a menu
		var menu = $('#menubar');
		if (menu.length === 0)
			return;

		// Get scrollbar elements
		var menuScroller = $('.menubar-scroll-panel');
		var parent = menuScroller.parent();

		// Add the scroller wrapper
		if (parent.hasClass('nano-content') === false) {
			menuScroller.wrap('<div class="nano"><div class="nano-content"></div></div>');
		}

		// Set the correct height
		var height = $(window).height() - menu.position().top - menu.find('.nano').position().top;
		var scroller = menuScroller.closest('.nano');
		scroller.css({ height: height });

		// Add the nanoscroller
		scroller.nanoScroller({ preventPageScrolling: true, iOSNativeScrolling: true });
	};


	// =========================================================================
	// DEFINE NAMESPACE
	// =========================================================================

	window.materialadmin.AppNavigation = new AppNavigation;
} (this.materialadmin, jQuery)); // pass in (namespace, jQuery):


//=======
// END AppNavigation
//=======


//=================================
// BEGIN CHECK PASSWORD
//=================================
$(document).ready(function () {
	$(".form-group #re-password").blur(function () {
		var o = $(this);
		if ($("#re-password").val() !== "") {
			if ($("#re-password").val() !== $("#password").val()) {
				o.parent().addClass("has-error");
				o.parent().append("<span id='re-password-error' class='help-block'>Confirm password doesn't match</span>");
				$("#btnAddCustomer").addClass("disabled");
			} else {
				o.parent().removeClass('has-error');
				$("#re-password-error").remove();
				$("#btnAddCustomer").removeClass("disabled");
			}
		}
	});

});
//=================================
// END CHECK PASSWORD
//=================================

//=================================
// BEGIN DROPDOWN CUSTOMER
//=================================
(function ($) {
	/*var oTable = $("#tableItem").DataTable();
	$("#customer-item").on("keyup", function () {
		var data = oTable.column(2, { search: 'applied' }).search($(this).val()).data();
		$("#auto-item").empty();
		data.each(function (value, index) {
			$("#auto-item").append($("<li class='suggest'><span class='suggest-name'>" + value + "</span></li>"));
		}, this);
		$("#auto-item").removeClass("search-text").addClass("search-text-down");
		$(".suggest").on("click", function () {
			o = $(this).children();
			$("#customer-item").val(o.text());
			$("#auto-item").removeClass("search-text-down").addClass("search-text");
		});
	});
	
	var eTable = $("#tableFeedback").DataTable();
	$("#customer-feedback").on("keyup", function () {
		var data = eTable.column(2, { search: 'applied' }).search($(this).val()).data();
		$("#auto-feedback").empty();
		data.each(function (value, index) {
			$("#auto-feedback").append($("<li class='suggest'><span class='suggest-name'>" + value + "</span></li>"));
		}, this);
		$("#auto-feedback").removeClass("search-text").addClass("search-text-down");
		$(".suggest").on("click", function () {
			o = $(this).children();
			$("#customer-feedback").val(o.text());
			$("#auto-feedback").removeClass("search-text-down").addClass("search-text");
		});
	});*/
	var AutoComplete = function () {
        $('.auto').parent().find('input').on('mouseover', function () {
			//get data from input element
			var autoTarget = $(this).parent().find('ul');
			var inputTarget = $(autoTarget).attr('input-target');
			var tableTarget = $(autoTarget).attr('table-target');	
			var eTable = $(tableTarget).DataTable();
			//if keyup will be searching for value in the input and add li with the element value inside
			$(inputTarget).on("keyup", function () {
				var data = eTable.column(2, { search: 'applied' }).search($(this).val()).data().unique();
				$(autoTarget).empty();
				data.each(function (value, index) {
					$(autoTarget).append($("<li class='suggest'><span class='suggest-name'>" + value + "</span></li>"));
				}, this);
				$(autoTarget).removeClass("search-text").addClass("search-text-down");
				$(".suggest").on("click", function () {
					o = $(this).children();
					$(inputTarget).addClass("dirty").val(o.text());
					$(autoTarget).removeClass("search-text-down").addClass("search-text");
				});
			});
			// if the modal closet, all input and data search will be blank
			$(".reset").on("click", function () {				
				$(this).parents("form")[0].reset();
				eTable.column(2).search("").data();
			});
		});
    };
	$(document).ready(function () {
		AutoComplete();
	});

} (jQuery));

//=================================
// END DROPDOWN CUSTOMER
//=================================
