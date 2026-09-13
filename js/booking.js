// Keep the ordinary booking links usable when the external widget is unavailable.
if (typeof SimplybookWidget === 'function') {
    const bookingWidget = new SimplybookWidget({
        widget_type: 'button',
        postpone: true,
        url: 'https://irisabella.simplybook.it',
        theme: 'simple_beauty_theme',
        theme_settings: {
            sb_base_color: '#5C2282',
            header_color: '#f2f2f2',
            body_bg_color: '#f2f2f2',
            dark_font_color: '#333333',
            light_font_color: '#ffffff',
            btn_color_1: '#5C2282',
            sb_company_label_color: '#5C2282',
            timeline_hide_unavailable: '1',
            hide_past_days: '0',
            timeline_show_end_time: '0',
            timeline_modern_display: 'as_slots',
            display_item_mode: 'block',
            hide_img_mode: '0',
            show_sidebar: '1',
            sb_busy: '#c7b3b3',
            sb_available: '#CAB2E0'
        },
        timeline: 'modern',
        datepicker: 'top_calendar',
        is_rtl: false,
        app_config: { clear_session: 0, allow_switch_to_ada: 0, predefined: [] },
        button_title: 'Plan je healing'
    });
    bookingWidget.addButtonWidgetStyles();

    document.querySelectorAll('.booking-button').forEach(link => {
        link.setAttribute('aria-haspopup', 'dialog');
        link.setAttribute('aria-expanded', 'false');
        link.addEventListener('click', event => {
            // Preserve opening the booking page in a new tab with modifier keys.
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            bookingWidget._triggerElement = link;
            bookingWidget.showPopupFrame('book');
            event.preventDefault();
        });
    });
}
