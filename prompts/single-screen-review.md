# Single Screen Deep Dive Review

## 🎯 Focused Component Analysis Protocol

Conduct an intensive, granular review of ONE specific screen, section, or component only. This is surgical-level analysis — not broad system review.

## 🔍 Single Focus Scope

### Target Definition
- Target only the explicitly specified area/screen/section
- Analyze every visual element, interaction, and functional detail within that boundary
- Ignore all other areas unless they directly impact the target zone

## 📐 Precision Analysis Requirements

### Visual Assessment
- Layout efficiency and use of space
- Spacing consistency and alignment precision
- Visual hierarchy and information flow
- Color usage and contrast ratios
- Typography readability and consistency

### Functional Review
- All interactive elements behavior
- Form validation and error handling
- Loading states and transitions
- Responsiveness across breakpoints
- Touch targets and click areas

### Content Evaluation
- Text clarity and conciseness
- Information architecture within the component
- User comprehension flow
- Help text and guidance effectiveness
- Error message clarity

### Performance Check
- Loading states implementation
- Animation smoothness
- Resource optimization
- Render performance
- Network request efficiency

### Accessibility Audit
- Keyboard navigation flow
- Screen reader compatibility
- ARIA labels and roles
- Focus management
- Color contrast compliance

## 🎯 Deep Dive Methodology

### Pixel-Level Inspection
- Examine spacing, alignment, and visual consistency with microscopic precision
- Verify grid alignment and consistent margins
- Check for visual artifacts or rendering issues
- Validate responsive behavior at all breakpoints

### Interaction Testing
- Test every clickable element, form field, and user pathway within the target area
- Verify hover states, active states, and focus indicators
- Check touch responsiveness on mobile devices
- Validate keyboard shortcuts and tab order

### Content Flow Analysis
- Evaluate information hierarchy and user comprehension
- Check reading patterns and visual flow
- Verify content prioritization
- Assess cognitive load

### Edge Case Scenarios
- Test boundary conditions and limits
- Verify empty states appearance
- Check error condition handling
- Test with extreme data inputs
- Validate offline behavior

### Cross-Device Validation
- Verify behavior across different screen sizes and contexts
- Test on various browsers and platforms
- Check mobile-specific interactions
- Validate print styles if applicable

## 📋 Deliverable Format

### Issue Report Structure

#### 1. Specific Issue Identification
- **Location**: Exact element/area within the component
- **Issue Type**: Visual/Functional/Content/Performance/Accessibility
- **Severity**: Critical/High/Medium/Low
- **Description**: Clear explanation of the problem
- **Steps to Reproduce**: If applicable

#### 2. Targeted Solutions
- **Recommended Fix**: Precise solution for the issue
- **Alternative Approaches**: If multiple solutions exist
- **Implementation Notes**: Technical considerations
- **Design Mockup**: If visual changes needed

#### 3. Impact Assessment
- **User Impact**: How this affects user experience
- **Business Impact**: Potential consequences if unfixed
- **Technical Debt**: Long-term implications

#### 4. Implementation Priority
- **Must Fix**: Critical issues blocking functionality
- **Should Fix**: Important improvements for UX
- **Nice to Have**: Minor enhancements
- **Future Consideration**: Long-term optimization

## 🚫 Strict Boundary Rules

### Scope Limitations
- Do not expand scope beyond the specified area
- Do not suggest system-wide changes or architecture modifications
- Focus recommendations only on the designated screen/component
- If broader issues are discovered, flag them separately but keep focus narrow

### Review Boundaries
- Stay within the defined component/screen limits
- Don't analyze connected screens unless explicitly requested
- Avoid proposing changes to shared components unless they only affect target area
- Keep recommendations actionable within the defined scope

## 💡 Best Used For

### Ideal Scenarios
- **Problematic screens** that need intensive attention
- **Pre-launch final reviews** of specific features
- **Detailed optimization** of high-traffic areas
- **Troubleshooting** specific user experience issues
- **Quality assurance** on individual components
- **Conversion optimization** for critical user paths
- **Accessibility compliance** for specific interfaces
- **Performance bottleneck** investigation

## Usage Example

```bash
# Get the single screen review prompt
cuecli get single-screen-review

# Then specify your target:
# "Review the checkout form component in detail"
# "Analyze the user dashboard main screen"
# "Deep dive on the mobile navigation menu"
```

## Review Checklist

- [ ] Visual elements thoroughly inspected
- [ ] All interactions tested and documented
- [ ] Content flow and hierarchy evaluated
- [ ] Performance metrics captured
- [ ] Accessibility standards verified
- [ ] Edge cases identified and tested
- [ ] Cross-device compatibility confirmed
- [ ] Specific, actionable recommendations provided
- [ ] Issues prioritized by impact
- [ ] Solutions stay within defined scope