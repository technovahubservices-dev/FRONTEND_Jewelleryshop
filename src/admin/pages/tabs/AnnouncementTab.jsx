export default function AnnouncementTab({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Announcement Text</label>
          <input
            type="text"
            value={settings?.announcementText || ''}
            onChange={(e) => updateSetting('announcementText', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Enter announcement text"
          />
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.announcementActive !== undefined ? settings.announcementActive : true}
                onChange={(e) => updateSetting('announcementActive', e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
              />
              <span className="font-body-md text-sm text-on-surface">Show Announcement Bar</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Background Color</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={settings?.announcementBgColor || '#013220'}
              onChange={(e) => updateSetting('announcementBgColor', e.target.value)}
              className="w-12 h-10 p-0 border border-outline-variant rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings?.announcementBgColor || '#013220'}
              onChange={(e) => updateSetting('announcementBgColor', e.target.value)}
              className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            />
          </div>
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Text Color</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={settings?.announcementTextColor || '#ffffff'}
              onChange={(e) => updateSetting('announcementTextColor', e.target.value)}
              className="w-12 h-10 p-0 border border-outline-variant rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings?.announcementTextColor || '#ffffff'}
              onChange={(e) => updateSetting('announcementTextColor', e.target.value)}
              className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            />
          </div>
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Text</label>
          <input
            type="text"
            value={settings?.announcementCtaText || ''}
            onChange={(e) => updateSetting('announcementCtaText', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="e.g. Shop Now"
          />
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Link</label>
          <input
            type="text"
            value={settings?.announcementCtaLink || '/shop'}
            onChange={(e) => updateSetting('announcementCtaLink', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="e.g. /shop"
          />
        </div>
      </div>
    </div>
  )
}
